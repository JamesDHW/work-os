# Built by `pnpm egress:image`. The runner starts it on an internal Docker network as the only route out of run containers.
ARG NODE_IMAGE=node:24-alpine
FROM ${NODE_IMAGE}
COPY dist/gateway.js /app/gateway.js
EXPOSE 3128 3129
CMD ["node", "/app/gateway.js"]
