const mdm = {
  namespaced: true,

  state: {
    uploadFileList: [],
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
