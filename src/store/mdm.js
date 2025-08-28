const fs = require('fs')

let uploadFileListStr = localStorage.getItem('uploadFileList');
let uploadFileList = [];

if (uploadFileListStr) {
  uploadFileList = JSON.parse(uploadFileListStr);

  uploadFileList.forEach((item) => {
    if (item.status !== 'success') {
      item.status = 'ready';

      let buffer = fs.readFileSync(item.filePath)
      console.log('buffer', buffer)

      if (buffer) {
        const uint8Array = new Uint8Array(buffer.buffer, buffer.byteOffset, buffer.byteLength);

        const file = new File([uint8Array], item.filename, {
          type: '',
          lastModified: item.file.lastModified
        });

        item.file = file
      }
    }
  });
}

const mdm = {
  namespaced: true,

  state: {
    uploadFileList: uploadFileList,
    showUploadBox: false,
  },

  mutations: {
    EDIT_UPLOAD_FILE(state, payload) {
      if (payload.action === 'add') {
        state.uploadFileList.push(payload.data);
      } else if (payload.action === 'delete') {
        let taskId = payload.data.taskId;
        const index = state.uploadFileList.findIndex((item) => item.taskId === taskId);
        state.uploadFileList.splice(index, 1);
      } else if (payload.action === 'update') {
        let taskId = payload.data.taskId;
        const index = state.uploadFileList.findIndex((item) => item.taskId === taskId);
        state.uploadFileList.splice(index, 1, payload.data);
      }
    },

    SET_SHOW_UPLOADED_BOX(state, payload) {
      state.showUploadBox = payload;
    },
  },

  actions: {},
};

export default mdm;
