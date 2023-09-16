/* eslint-disable */
const { NodeTracerProvider } = require('@opentelemetry/node');
const { SimpleSpanProcessor } = require('@opentelemetry/tracing');
const { JaegerExporter } = require('@opentelemetry/exporter-jaeger');

const provider = new NodeTracerProvider();

provider.addSpanProcessor(
    new SimpleSpanProcessor(
        new JaegerExporter({
            serviceName: process.env.JAEGER_SERVICE_NAME,
            endpoint: `http://${process.env.JAEGER_AGENT_HOST}:${process.env.JAEGER_AGENT_PORT}`
        })
    )
);

provider.register();