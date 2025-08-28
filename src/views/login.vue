<template>
  <div :class="['mti-login-container', { 'custom-container': handleLayoutMode() }]">
    <div class="mti-title-box">
      <img src="@/assets/images/login-title.png" alt="" />
    </div>

    <div class="login-form-box">
      <div class="welcome">欢迎登录NCC项目管理平台</div>

      <el-form
        ref="loginForm"
        :model="loginForm"
        label-position="top"
        :rules="loginRules"
        class="login-form"
        @submit.native.prevent
      >
        <!--  移动端二维码    -->
        <div v-if="showAppCode" class="app-code-content" @click="handleChangeCode">
          <div class="code"></div>
          <i :class="['iconfont app-code', [!isAppCode ? ' icon-code' : 'icon-login']]"></i>
          <div class="tips" v-if="!isAppCode">
            <div class="arrow"><em></em><span></span></div>
            <div class="content">移动端二维码</div>
          </div>
        </div>

        <!--  PC端登陆表单    -->
        <template v-if="!isAppCode">
          <!--<h3 class="title" v-text="title"></h3>-->
          <div class="login-title">
            <div>账号密码登录</div>
            <div>欢迎回来，输入您的凭据以访问您的帐户</div>
          </div>

          <div class="login-mode-tabs" v-if="showMessageLogin">
            <span
              v-for="item of loginTabsData"
              :key="item.type"
              :class="{ cur: item.type === loginActiveTab }"
              @click="changeLoginTabs(item.type)"
              >{{ item.label }}</span
            >
          </div>
          <template v-if="loginActiveTab === 'password'">
            <el-form-item prop="username" label="账号/用户名">
              <el-input v-model="loginForm.username" type="text" auto-complete="off" placeholder="账号" clearable>
                <svg-icon slot="prefix" icon-class="user" class="el-input__icon input-icon" />
              </el-input>
            </el-form-item>
            <el-form-item prop="password" label="密码">
              <el-input
                v-model="loginForm.password"
                type="password"
                auto-complete="off"
                placeholder="密码"
                @keyup.enter.native="handleLogin"
                clearable
              >
                <svg-icon slot="prefix" icon-class="password" class="el-input__icon input-icon" />
              </el-input>
            </el-form-item>
            <el-form-item prop="code" v-if="captchaOnOff" label="验证">
              <el-input
                type="number"
                v-model="loginForm.code"
                auto-complete="off"
                placeholder="验证码"
                style="width: 63%"
                @keyup.enter.native="handleLogin"
              >
                <svg-icon slot="prefix" icon-class="validCode" class="el-input__icon input-icon" />
              </el-input>
              <div class="login-code">
                <mti-img :src="codeUrl" class="login-code-img" :zoom="zoom" @click="getCode" />
              </div>
            </el-form-item>
            <div style="display: flex; justify-content: space-between">
              <el-checkbox v-model="loginForm.rememberMe" style="margin: 0px 0px 25px 0px">记住密码</el-checkbox>
              <!--<p style="cursor: pointer;color: #1181FA;margin: 0;font-size: 14px;" @click="goForgetPassword">忘记密码？</p>-->
            </div>
          </template>
          <template v-else>
            <el-form-item prop="phone">
              <el-input type="number" v-model="loginForm.phone" placeholder="请输入手机号码" clearable>
                <span slot="prefix" class="el-icon-mobile-phone mobile-phone"></span>
              </el-input>
            </el-form-item>
            <el-form-item prop="mediumCode" class="login-message-code">
              <div class="send-content">
                <el-input type="number" v-model="loginForm.mediumCode" auto-complete="off" placeholder="短信验证码">
                  <span slot="prefix" class="el-icon-key mobile-phone"></span>
                </el-input>
                <el-button type="primary" @click="sendValidationCode" :disabled="timeCount > 0">
                  <span class="send-btn">{{ timeCount > 0 ? timeCount : '发送验证码' }}</span>
                </el-button>
              </div>
            </el-form-item>
          </template>
          <el-form-item style="width: 100%">
            <el-button
              :loading="loading"
              size="medium"
              type="primary"
              style="width: 100%"
              @click.native.prevent="handleLogin"
            >
              {{ !loading ? '登 录' : '登 录 中...' }}
            </el-button>
            <div style="float: right" v-if="register">
              <router-link class="link-type" :to="'/register'">立即注册</router-link>
            </div>
          </el-form-item>
        </template>

        <!--   移动端二维码   -->
        <!--<template v-if="isAppCode">-->
        <!--  <slot>-->
        <!--    <h3 class="title">移动端二维码</h3>-->
        <!--    <el-row class="mti-app-code-content">-->
        <!--      <el-col :span="12">-->
        <!--        <mti-qr-code id="iosCode" :url="appCodeData.iosUrl" colorDark="#1181fa"></mti-qr-code>-->
        <!--        <div class="title">IOS二维码</div>-->
        <!--      </el-col>-->
        <!--      <el-col :span="12">-->
        <!--        <mti-qr-code id="androidCode" :url="appCodeData.androidUrl"></mti-qr-code>-->
        <!--        <div class="title">Android二维码</div>-->
        <!--      </el-col>-->
        <!--    </el-row>-->
        <!--  </slot>-->
        <!--</template>-->
      </el-form>
    </div>

    <!-- 密码修改 -->
    <el-dialog
      v-dialog-drag
      :visible.sync="open"
      :mask-closable="false"
      :close-on-click-modal="false"
      width="500px"
      append-to-body
    >
      <div slot="title" class="el-dialog__title">
        密码修改<span class="text-danger ml0 fs12 fw600">首次登录，请修改密码</span>
      </div>
      <el-form ref="form" :model="user" :rules="rules" label-width="80px" @submit.native.prevent>
        <el-form-item label="旧密码" prop="oldPassword">
          <el-input v-model="user.oldPassword" placeholder="请输入旧密码" type="password" />
        </el-form-item>
        <el-form-item label="新密码" prop="newPassword">
          <el-input v-model="user.newPassword" placeholder="请输入新密码" type="password" />
        </el-form-item>
        <el-form-item label="确认密码" prop="confirmPassword">
          <el-input v-model="user.confirmPassword" placeholder="请确认密码" type="password" />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="open = false">关 闭</el-button>
        <el-button type="primary" @click="submitPasswordForm">提 交</el-button>
      </div>
    </el-dialog>

    <!--  账号锁定  -->
    <el-dialog
      title="账号锁定倒计时"
      :visible.sync="lockDialogTimeShow"
      :show-close="false"
      :close-on-click-modal="false"
      :close-on-press-escape="false"
      :center="true"
      width="30%"
      class="pass-countdown"
    >
      <div class="lock-dialog-container">
        <div class="lock-dialog-item">
          {{ lockDialogTimeComputed[0] }}
        </div>
        <div class="lock-dialog-colon">:</div>
        <div class="lock-dialog-item">
          {{ lockDialogTimeComputed[1] }}
        </div>
        <div class="lock-dialog-colon">:</div>
        <div class="lock-dialog-item">
          {{ lockDialogTimeComputed[2] }}
        </div>
      </div>
    </el-dialog>

    <!-- 版权 底部  -->
    <!--<div class="el-login-footer" v-if="!handleLayoutMode()">-->
    <!--  <span>Copyright © 2018-newest ctcemti.com All Rights Reserved.</span>-->
    <!--</div>-->
  </div>
</template>

<script>
import { getCodeImg, sendValidationCode } from 'ctcemti-ui/src/api/login';
import Cookies from 'js-cookie';
import { encrypt, decrypt } from 'ctcemti-ui/src/utils/jsencrypt';
import { updateUserPwdNotLogin } from 'ctcemti-ui/src/api/system/user';
import { validateSpecialKeyTypes } from 'ctcemti-ui/src/views/system/settings/validate';
import MtiImg from 'ctcemti-ui/src/components/Img/index.vue';
// import MtiQrCode from 'ctcemti-ui/src/components/QRCode/index.vue';
import { StringUtil } from 'ctcemti-ui/src/utils/base/StringUtil';

export default {
  name: 'Login',
  components: {
    MtiImg,
    // MtiQrCode,
  },
  props: {
    /** 是否打开移动端二维码 */
    showAppCode: {
      type: Boolean,
      default: false,
    },
    /** 是否打开短信登录 */
    showMessageLogin: {
      type: Boolean,
      default: false,
    },
    /** 二维码参数 */
    appCodeData: {
      type: Object,
      default() {
        return {
          iosUrl: '',
          androidUrl: '',
        };
      },
    },
    /** 布局模式 */
    layoutMode: {
      type: String,
      default: '',
    },
    /**
     * 验证码是否支持放大
     */
    zoom: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      codeErrorSrc: require('../assets/images/woman.png'),
      codeUrl: '',
      loginForm: {
        username: '',
        password: '',
        rememberMe: false,
        code: '',
        uuid: '',
        phone: '',
        mediumCode: '',
      },
      loginRules: {
        username: [{ required: true, trigger: 'blur', message: '请输入您的账号' }],
        password: [{ required: true, trigger: 'blur', message: '请输入您的密码' }],
        code: [{ required: true, trigger: 'change', message: '请输入验证码' }],
        phone: [
          { required: true, message: '请输入正确的手机号', trigger: 'blur' },
          {
            required: true,
            validator: (rule, value, callback) => {
              if (!StringUtil.isMobileNum(value)) {
                callback(new Error('请输入正确的手机号'));
              } else {
                callback();
              }
            },
            trigger: 'blur',
          },
        ],
        mediumCode: [{ required: true, trigger: 'blur', message: '请输入验证码' }],
      },
      loading: false,
      // 验证码开关
      captchaOnOff: true,
      // 注册开关
      register: false,
      redirect: undefined,
      // 是否显示弹出层
      open: false,
      // 密码修改数据对象
      user: {
        oldPassword: undefined,
        newPassword: undefined,
        confirmPassword: undefined,
      },
      // 重置密码表单校验
      rules: {
        oldPassword: [{ required: true, message: '旧密码不能为空', trigger: 'blur' }],
        newPassword: [
          {
            required: true,
            trigger: 'change',
          },
        ],
        confirmPassword: [
          { required: true, message: '确认密码不能为空', trigger: 'blur' },
          {
            required: true,
            validator: (rule, value, callback) => {
              if (this.user.newPassword !== value) {
                callback(new Error('两次输入的密码不一致'));
              } else {
                callback();
              }
            },
            trigger: 'blur',
          },
        ],
      },

      lockDialogTime: 0,
      lockDialogTimeShow: false,
      lockDialogTimeInterval: null,
      loginFormModel: {},
      isAppCode: false,
      loginTabsData: [
        {
          label: '密码登录',
          type: 'password',
        },
        {
          label: '短信登录',
          type: 'message',
        },
      ],
      loginActiveTab: 'password',
      timeCount: 0,
    };
  },
  watch: {
    $route: {
      handler: function (route) {
        this.redirect = route.query && route.query.redirect;
      },
      immediate: true,
    },
  },
  computed: {
    title() {
      return process.env.VUE_APP_TITLE || '登录';
    },
    lockDialogTimeComputed() {
      function twoSit(num) {
        return Number(num) < 10 ? `0${num}` : num;
      }
      const times = parseInt(this.lockDialogTime);
      let hh = parseInt(times / 3600); //小时
      let shh = times - hh * 3600;
      let ii = parseInt(shh / 60);
      let ss = shh - ii * 60;
      return [twoSit(hh), twoSit(ii), twoSit(ss)];
    },
  },
  created() {
    this.getCode();
    this.getCookie();
  },
  methods: {
    /**
     * 切换登录tabs
     */
    changeLoginTabs(type) {
      this.loginActiveTab = type;
      this.$refs['loginForm'].resetFields();
      this.loginForm = {
        username: '',
        password: '',
        rememberMe: this.loginForm.rememberMe,
        code: '',
        uuid: this.loginForm.uuid,
        phone: '',
        mediumCode: '',
      };
    },
    /**
     * 发送短信
     */
    sendValidationCode() {
      const params = {
        mediumType: '1',
        medium: this.loginForm.phone,
      };

      if (!StringUtil.isMobileNum(this.loginForm.phone)) {
        return this.$message.error('请输入正确的手机号');
      }

      sendValidationCode(params).then((res) => {
        this.$message.success('验证码发送成功~');
        this.timeCountDown();
      });
    },
    /**
     * 验证码或邮件倒计时
     */
    timeCountDown() {
      let that = this;
      that.timeCount = 90;
      //设置阅读协议的倒计时
      let countdown = setInterval(() => {
        if (that.timeCount > 1) {
          that.timeCount--;
        } else {
          clearInterval(countdown);
          that.timeCount = 0;
        }
      }, 1000);
    },
    // 处理登录布局模式
    handleLayoutMode() {
      return this.layoutMode && this.layoutMode.includes('right');
    },
    // 切换移动端二维码
    handleChangeCode() {
      this.isAppCode = !this.isAppCode;
    },
    // 跳到忘记密码
    goForgetPassword() {
      this.$router.push('forgetPassword');
    },
    // 参考：系统设置 密码设置
    passwordValidateChange(passwordType = '1', passwordLength = 8) {
      passwordType = passwordType || '1,2,3';
      passwordLength = passwordLength || 8;
      this.rules.newPassword = [
        { required: true, validator: validateSpecialKeyTypes(passwordType, passwordLength), trigger: 'change' },
      ];
      this.$refs['form'].validateField(['newPassword'], (error) => {});
    },
    showLockDialog(number) {
      this.lockDialogTimeShow = true;
      this.lockDialogTime = number;
      const that = this;
      this.lockDialogTimeInterval = setInterval(() => {
        if (that.lockDialogTime == 0) {
          clearInterval(this.lockDialogTimeInterval);
          that.lockDialogTimeShow = false;
          return;
        }
        that.lockDialogTime -= 1;
      }, 1000);
    },
    getCode() {
      getCodeImg().then((res) => {
        this.captchaOnOff = res.captchaOnOff === undefined ? true : res.captchaOnOff;
        if (this.captchaOnOff) {
          this.codeUrl = 'data:image/gif;base64,' + res.img;
          this.loginForm.uuid = res.uuid;
        }
      });
    },
    getCookie() {
      const username = Cookies.get('username');
      const password = Cookies.get('password');
      const rememberMe = Cookies.get('rememberMe');
      this.loginForm = {
        username: username === undefined ? this.loginForm.username : username,
        password: password === undefined ? this.loginForm.password : decrypt(password),
        rememberMe: rememberMe === undefined ? false : Boolean(rememberMe),
      };
    },
    handleLogin() {
      this.$refs.loginForm.validate((valid) => {
        if (valid) {
          this.loading = true;
          if (this.loginActiveTab === 'password') {
            if (this.loginForm.rememberMe) {
              Cookies.set('username', this.loginForm.username, { expires: 30 });
              Cookies.set('password', encrypt(this.loginForm.password), {
                expires: 30,
              });
              Cookies.set('rememberMe', this.loginForm.rememberMe, {
                expires: 30,
              });
            } else {
              Cookies.remove('username');
              Cookies.remove('password');
              Cookies.remove('rememberMe');
            }
          }

          this.loginFormModel = {
            ...this.loginForm,
            password: encrypt(this.loginForm.password),
            // 用户名密码登陆：null或1， 手机号验证码登陆：2，手机端扫码登陆：3
            loginMode: this.loginActiveTab === 'message' ? 2 : null,
          };

          this.$store
            .dispatch('Login', this.loginFormModel)
            .then(() => {
              this.loading = false;
              this.$router.push({ path: this.redirect || '/completionData/index' }).catch(() => {});
            })
            .catch((err) => {
              this.loading = false;
              // 首次登录，请修改密码 + 500 作为 首次强制修改密码的 标识，
              const { code, msg, data } = err;
              if (code == 500 && msg == '首次登录，请修改密码') {
                const { passwordLength, passwordType } = data;
                this.open = true;

                this.passwordValidateChange(passwordType.split(','), passwordLength);
              } else if (code == 500 && data && data.lockTime) {
                this.showLockDialog(Number(data.lockTime));
              }
              if (this.captchaOnOff) {
                this.getCode();
              }
            });
        }
      });
    },
    submitPasswordForm() {
      this.$refs['form'].validate((valid) => {
        if (valid) {
          updateUserPwdNotLogin(
            this.user.oldPassword,
            this.user.newPassword,
            this.loginForm.username,
            this.loginForm.password,
          ).then((response) => {
            this.$modal.msgSuccess('修改成功');
            this.$store.dispatch('Logout').then(() => {
              setTimeout(function () {
                window.location.reload();
              }, 500);
            });
          });
        }
      });
    },
  },
};
</script>

<style lang="scss">
.mti-login-container {
  display: flex;
  justify-content: flex-end;
  padding-right: 12%;
  align-items: center;
  height: 100%;
  background: #1168eb url('../assets/images/login-background2.png');
  background-size: cover;
  position: relative;

  .mti-title-box {
    position: absolute;
    left: 94px;
    top: 63px;

    > img {
      width: 14vw;
    }
  }

  .login-form-box {
    .welcome {
      color: #ffffff;
      font-size: 20px;
      margin-bottom: 20px;
      text-align: center;
    }
  }

  .title {
    margin: 0px auto 30px auto;
    text-align: center;
    color: #707070;
  }

  .login-form {
    border-radius: 6px;
    background: #ffffff;
    width: 400px;
    padding: 25px 25px 5px 25px;
    position: relative;

    .login-title {
      > div {
        &:nth-child(1) {
          color: #000000;
          font-weight: bold;
          font-size: 20px;
          margin-bottom: 6px;
        }

        &:nth-child(2) {
          color: #828699;
          font-size: 14px;
          margin-bottom: 15px;
        }
      }
    }

    .el-form-item__label {
      padding-bottom: 2px;
      color: #3a3d4c;

      &::before {
        display: none;
      }
    }

    .el-form-item__error {
      padding-top: 5px !important;
    }

    .el-input {
      height: 38px;
      input {
        height: 38px;
      }
    }
    .input-icon {
      height: 39px;
      width: 14px;
      margin-left: 2px;
    }
  }
  .login-tip {
    font-size: 13px;
    text-align: center;
    color: #bfbfbf;
  }
  .login-code {
    width: 33%;
    height: 38px;
    float: right;
    img {
      cursor: pointer;
      vertical-align: middle;
    }
  }
  .el-login-footer {
    height: 40px;
    line-height: 40px;
    position: fixed;
    bottom: 0;
    width: 100%;
    text-align: center;
    color: #fff;
    font-family: Arial;
    font-size: 12px;
    letter-spacing: 1px;
  }
  .login-code-img {
    height: 38px;
  }

  .app-code-content {
    position: absolute;
    top: 0;
    right: 0;
    cursor: pointer;

    .code {
      width: 0;
      height: 0;
      border-color: #fff transparent;
      border-width: 0 50px 50px 0;
      border-style: solid;
      position: absolute;
      top: 0;
      right: 0;
      z-index: 2;
    }

    .app-code {
      font-size: 48px;
      position: absolute;
      top: 0;
      right: 0;
      z-index: 1;
      color: #1181fa;
    }

    .app-code.icon-login {
      right: 2px;
      font-size: 46px;
    }

    .tips {
      border: 1px solid #1181fa;
      background: #eaf1fd;
      margin: 4px 50px 0 0;
      position: relative;

      .arrow {
        position: absolute;
        z-index: 10;
        top: 8px;
        right: 0;

        em,
        span {
          width: 0;
          height: 0;
          position: absolute;
        }

        em {
          border-left: 8px solid #1181fa;
          border-top: 7px solid transparent;
          border-bottom: 7px solid transparent;
          top: -5px;
        }

        span {
          border-left: 8px solid #eaf1fd;
          border-top: 7px solid transparent;
          border-bottom: 7px solid transparent;
          top: -5px;
          right: -6px;
        }
      }

      .content {
        color: #1181fa;
        font-size: 12px;
        font-weight: 400;
        padding: 2px 4px;
      }
    }
  }
}

.mti-login-container.custom-container {
  background-image: url('../assets/images/login_custom.jpg');
  justify-content: end;

  .login-form {
    margin-right: 16%;
    border-radius: 0;
    box-shadow: rgba(0, 0, 0, 0.15) 0px 2px 15px;
  }
}

.login-mode-tabs {
  height: 30px;
  line-height: 30px;
  margin-bottom: 20px;
  font-size: 16px;
  color: #8c8c8c;
  font-weight: 600;

  span {
    cursor: pointer;
    padding-right: 20px;
    position: relative;

    &:hover {
      color: #717171;
    }
  }

  span.cur {
    color: #717171;
  }

  span.cur::after {
    content: '';
    position: absolute;
    left: 0;
    bottom: -6px;
    width: 64px;
    display: block;
    height: 2px;
    background: #666;
  }
}

.mobile-phone {
  font-size: 16px;
  line-height: 38px !important;
}

.login-message-code {
  margin-bottom: 38px !important;

  .send-content {
    display: flex;

    .el-input {
      margin-right: 20px;
    }

    .send-btn {
      display: inline-block;
      width: 80px;
    }
  }
}
</style>
<style scoped>
/* 锁定的弹窗 */
.pass-countdown {
  display: flex;
}
.pass-countdown /deep/ .el-dialog {
  height: 140px;
  margin: auto auto !important;
}
.lock-dialog-time {
  text-align: center;
  font-size: 30px;
  font-weight: bolder;
}
.lock-dialog-container {
  display: flex;
  justify-content: center;
  align-items: center;
}
.lock-dialog-item {
  width: 30px;
  height: 30px;
  line-height: 30px;
  text-align: center;
  border-radius: 5px;
  background: #efefef;
  color: #1e1e1e;
}
.lock-dialog-colon {
  margin: 0 8px;
}
</style>
