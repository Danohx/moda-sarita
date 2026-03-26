import { securityApi } from "../../../../shared/api/security.api";

type Enable2FAPayload = Parameters<typeof securityApi.enable2FA>[0];

export const securityService = {
  async setup2FA() {
    return securityApi.setup2FA();
  },

  async enable2FA(payload: Enable2FAPayload) {
    return securityApi.enable2FA(payload);
  },
};