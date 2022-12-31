"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const app_module_1 = require("./app.module");
<<<<<<< HEAD
const platform_ws_1 = require("@nestjs/platform-ws");
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    app.useWebSocketAdapter(new platform_ws_1.WsAdapter(app));
=======
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
>>>>>>> 96349e5 (init: 建立後端專案)
    await app.listen(3000);
}
bootstrap();
//# sourceMappingURL=main.js.map