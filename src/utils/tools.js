import request from '@/utils/request';
import { kjService } from '@/utils/request';
import store from '@/store';

// 读取文件 md5
export function readFile(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => resolve(e.target.result);
    reader.onerror = (e) => reject(e);
    reader.readAsArrayBuffer(file);
  });
}

// 文件上传
export async function singleFilePartPointUpload(uploadItem) {
  // homeLocal  linkLocal
  if (uploadItem.uploadType === 'homeLocal' || uploadItem.uploadType === 'linkLocal') {
    let partSize = 1; //MB
    let totalChunks = Math.ceil(uploadItem.file.size / 1024 / 1024 / partSize);
    let id = uploadItem.debrisIUID || newGuid();

    uploadItem.debrisIUID = id;

    for (let i = 0; i < totalChunks; i++) {
      // 如果返回已经上传的partIndex是当前i，则不在上传该part文件
      if (uploadItem.parts.indexOf(i) !== -1) continue;

      if (uploadItem.status !== 'uploading') return;

      let fileParam = new FormData();
      fileParam.append('data', uploadItem.file.slice(i * 1024 * 1024 * partSize, (i + 1) * 1024 * 1024 * partSize));
      fileParam.append('totalSize', uploadItem.file.size);
      fileParam.append('fileName', uploadItem.file.name);
      fileParam.append('totalChunks', totalChunks);
      fileParam.append('chunkNumber', i + 1);
      fileParam.append('DebrisIUID', id);
      fileParam.append('Savepath', `D:/Ncc文件/${id}/`);

      // 跨界上传接口
      let res1 = await kjService({
        url: '/api/imodel/imodelFileAdd',
        method: 'post',
        data: fileParam,
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }).catch(() => {});

      if (res1 && res1.code === 0) {
        uploadItem.parts.push(i);
        uploadItem.progress = (((i + 1) / totalChunks) * 100).toFixed(2);

        // 全部分片上传完成
        if (i + 1 === totalChunks) {
          uploadItem.status = 'success';

          // 关联模型处理
          if (uploadItem.uploadType === 'linkLocal') {
            await request({
              url: '/mdm/mdm_config_model/FilePartPointUpload',
              method: 'post',
              params: {
                id: uploadItem.id,
                filename: uploadItem.file.name,
                filepath: res1.savePathText,
              },
            });
          }

          document.dispatchEvent(
            new CustomEvent('uploadLocalRefresh', {
              detail: {
                uploadItem,
                savePathText: res1.savePathText,
              },
            }),
          );

          // 开始上传下一个文件
          let fileList = store.state.mdm.uploadFileList;
          const nextFile = fileList.find((item) => item.status === 'ready');

          if (nextFile) {
            nextFile.status = 'uploading';
            singleFilePartPointUpload(nextFile);
          }
        }
      } else {
        setTimeout(() => {
          singleFilePartPointUpload(uploadItem);
        }, 1000);

        return;
      }
    }
  }
  // oss
  else if (uploadItem.uploadType === 'oss') {
    let partSize = 8; //MB
    let partNum = Math.ceil(uploadItem.file.size / 1024 / 1024 / partSize);

    if (!uploadItem.parts.length) {
      let identifier = await request({
        url: '/mdm/mdm_file_run/getMD5FileIdentifier',
        method: 'get',
        params: {
          fileName: uploadItem.file.name,
        },
      });

      uploadItem.fileMd5 = identifier.data;

      let res = await request({
        url: '/mdm/mdm_file_run/taskInfo',
        method: 'get',
        params: {
          identifier: uploadItem.fileMd5,
          fileName: uploadItem.file.name,
          folderPath: uploadItem.file.webkitRelativePath || uploadItem.file.name,
          totalSize: uploadItem.file.size,
          chunkSize: partSize * 1024 * 1024,
          isPrivateBucket: false,
          id: uploadItem.id,
          massif: uploadItem.massif,
          ban: uploadItem.ban,
          typeStr: uploadItem.typeStr,
        },
      }).catch((error) => error);

      if (res?.code === 200) {
        uploadItem.folderId = res.data.folderId;
        await uploadChunkFile(uploadItem, partNum, partSize);
      } else if (res?.code === 10000001) {
        uploadItem.status = 'error';
      } else {
        setTimeout(() => {
          singleFilePartPointUpload(uploadItem);
        }, 200);
      }
    } else {
      await uploadChunkFile(uploadItem, partNum, partSize);
    }
  }
}

async function uploadChunkFile(uploadItem, partNum, partSize) {
  for (let i = 0; i < partNum; i++) {
    // 如果返回已经上传的partIndex是当前i，则不在上传该part文件
    if (uploadItem.parts.indexOf(i) !== -1) continue;

    if (uploadItem.status !== 'uploading') return;

    let fileParam = new FormData();
    fileParam.append('file', uploadItem.file.slice(i * 1024 * 1024 * partSize, (i + 1) * 1024 * 1024 * partSize));
    fileParam.append('identifier', uploadItem.fileMd5);
    fileParam.append('partNumber', i + 1);

    let res1 = await request({
      url: '/mdm/mdm_file_run/uploadPartFile',
      method: 'post',
      data: fileParam,
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }).catch(() => {});

    // 判断最后一个分片文件传完之后，后台检验文件上传情况
    if (res1 && res1.code === 200) {
      uploadItem.parts.push(i);
      uploadItem.progress = (((i + 1) / partNum) * 100).toFixed(2);

      // 全部分片上传完成
      if (i + 1 === partNum) {
        let res2 = await request({
          url: `/mdm/mdm_file_run/merge/${uploadItem.fileMd5}/false?id=${uploadItem.folderId}&massif=${uploadItem.massif}&ban=${uploadItem.ban}&typeStr=${uploadItem.typeStr}`,
          method: 'post',
        }).catch(() => {});

        if (res2.code === 200) {
          uploadItem.status = 'success';

          document.dispatchEvent(
            new CustomEvent('uploadOSSRefresh', {
              detail: {
                parentId: uploadItem.id,
              },
            }),
          );

          // 开始上传下一个文件
          let fileList = store.state.mdm.uploadFileList;
          const nextFile = fileList.find((item) => item.status === 'ready');

          if (nextFile) {
            nextFile.status = 'uploading';
            singleFilePartPointUpload(nextFile);
          }
        } else {
          setTimeout(() => {
            singleFilePartPointUpload(uploadItem);
          }, 200);
        }
      }
    } else {
      setTimeout(() => {
        singleFilePartPointUpload(uploadItem);
      }, 1000);

      return;
    }
  }
}

export function modelIframePostMes(iframeWin, command, Data) {
  iframeWin.postMessage(
    {
      command,
      Data,
    },
    '*',
  );
}

export function closeModel(url, callback) {
  var iframe = document.getElementById('CloseModel');

  if (iframe == null) {
    iframe = document.createElement('iframe');
    iframe.id = 'CloseModel';
  }

  iframe.src = url;
  iframe.hidden = true;
  document.body.appendChild(iframe);

  iframe.onload = () => {
    window.addEventListener(
      'message',
      async (msg) => {
        if (msg.data.command === 'beforeImodelClose') {
          let CloseModelIframe = document.getElementById('CloseModel');
          setTimeout(() => {
            if (callback) {
              callback();
            }
          }, 100);

          if (CloseModelIframe != null) {
            setTimeout(() => {
              document.body.removeChild(CloseModelIframe);
            }, 1000);
          }
        }
      },
      { once: true },
    );
  };
}

export function formatBytes(size, decimals = 2) {
  size = Number(size);

  if (size === 0) return '0 B';

  const units = ['B', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
  const index = Math.floor(Math.log(size) / Math.log(1024));

  return `${+(size / Math.pow(1024, index)).toFixed(decimals)} ${units[index]}`;
}

function $S4() {
  return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
}

export function newGuid() {
  return $S4() + $S4() + '-' + $S4() + '-' + $S4() + '-' + $S4() + '-' + $S4() + $S4() + $S4();
}
