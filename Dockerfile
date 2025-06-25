FROM node:20 as builder
COPY . /usr/app/wms-ui
WORKDIR /usr/app/wms-ui
RUN rm -f /usr/app/wms-ui/.env.local
ARG WMS_UI_TAG
ENV VITE_UI_VERSION=$WMS_UI_TAG
RUN npm install
RUN npm run build

# production environment
FROM picarro-host-team-base-image.jfrog.io/nginx:1.0
COPY --from=builder /usr/app/wms-ui/nginx.conf.template /etc/nginx/templates/nginx.conf.template
COPY --from=builder /usr/app/wms-ui/dist/ /usr/share/nginx/html
ENV NGINX_ENVSUBST_OUTPUT_DIR=/etc/nginx
CMD ["nginx", "-g", "daemon off;"] 