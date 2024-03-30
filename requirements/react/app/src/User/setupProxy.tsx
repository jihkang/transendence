import { Express } from "express";
import { createProxyMiddleware, RequestHandler } from "http-proxy-middleware";

const configureProxy = (app: Express): void => {
  const proxyOptions: RequestHandler = createProxyMiddleware({
    target: "http://localhost:42422",
    changeOrigin: true,
  });
  app.use("/api", proxyOptions);
};

export default configureProxy;
