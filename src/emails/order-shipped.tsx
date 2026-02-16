import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Link,
  Preview,
  Row,
  Section,
  Text,
} from "@react-email/components";

import { OrderEmailLayout } from "@/emails/components/order-email-layout";
import type { OrderEmailData } from "@/emails/types";

type OrderShippedEmailProps = {
  order: OrderEmailData;
};

const styles = {
  trackingContainer: {
    backgroundColor: "#f3f4f6",
    border: "1px solid #e5e7eb",
    borderRadius: "8px",
    padding: "16px",
    margin: "16px 0",
  },
  trackingLabel: {
    color: "#6b7280",
    fontSize: "12px",
    margin: "0 0 4px",
  },
  trackingCode: {
    color: "#111827",
    fontSize: "18px",
    fontWeight: "700",
    margin: "0 0 12px",
    fontFamily: "monospace",
  },
  trackingLink: {
    color: "#3b82f6",
    textDecoration: "underline",
    fontSize: "14px",
    margin: "0 0 12px",
  },
  buttonContainer: {
    margin: "12px 0 0",
  },
  button: {
    backgroundColor: "#3b82f6",
    color: "#ffffff",
    padding: "10px 20px",
    borderRadius: "6px",
    textDecoration: "none",
    fontSize: "14px",
    fontWeight: "600",
    display: "inline-block",
  },
  estimatedDelivery: {
    color: "#6b7280",
    fontSize: "12px",
    margin: "12px 0 0",
  },
};

const getCorreiosTrackingUrl = (trackingCode: string): string => {
  return `https://rastreamento.correios.com.br/app/index.php?codigo=${trackingCode}`;
};

export const OrderShippedEmail = ({ order }: OrderShippedEmailProps) => {
  return (
    <Html>
      <Head />
      <Preview>Pedido enviado com rastreamento</Preview>
      <Body
        style={{
          backgroundColor: "#f9fafb",
          fontFamily: "Arial, sans-serif",
          margin: 0,
          padding: "24px 0",
        }}
      >
        <Container
          style={{
            backgroundColor: "#ffffff",
            border: "1px solid #e5e7eb",
            borderRadius: "12px",
            margin: "0 auto",
            padding: "24px",
            width: "100%",
            maxWidth: "560px",
          }}
        >
          <Heading
            style={{
              color: "#111827",
              fontSize: "22px",
              fontWeight: "700",
              margin: "0 0 8px",
            }}
          >
            Pedido enviado
          </Heading>
          <Text
            style={{
              color: "#6b7280",
              fontSize: "14px",
              margin: "0 0 16px",
            }}
          >
            Seu pedido foi enviado. Em breve ele chega até você.
          </Text>
          <Text
            style={{
              color: "#111827",
              fontSize: "16px",
              fontWeight: "700",
              margin: "0 0 8px",
            }}
          >
            Pedido #{order.shortId}
          </Text>
          <Text
            style={{
              color: "#6b7280",
              fontSize: "12px",
              margin: "0 0 16px",
            }}
          >
            {order.customerName}
          </Text>

          {order.trackingCode && (
            <Section style={styles.trackingContainer}>
              <Text style={styles.trackingLabel}>Código de rastreamento:</Text>
              <Text style={styles.trackingCode}>{order.trackingCode}</Text>

              {(order.shippingMethod === "PAC" ||
                order.shippingMethod === "SEDEX") && (
                <Link
                  href={getCorreiosTrackingUrl(order.trackingCode)}
                  style={styles.trackingLink}
                >
                  → Rastrear no site dos Correios
                </Link>
              )}

              {order.shippingLabelUrl && (
                <Section style={styles.buttonContainer}>
                  <Button href={order.shippingLabelUrl} style={styles.button}>
                    📥 Download da Etiqueta
                  </Button>
                </Section>
              )}

              <Text style={styles.estimatedDelivery}>
                A entrega pode levar de 3 a 7 dias úteis, dependendo da região.
              </Text>
            </Section>
          )}

          <Hr
            style={{
              borderColor: "#e5e7eb",
              margin: "16px 0",
            }}
          />

          <Text
            style={{
              color: "#6b7280",
              fontSize: "12px",
              margin: "16px 0 0",
              textAlign: "center",
            }}
          >
            Studio Montenegro • contato@studiomontenegro.com.br
          </Text>
        </Container>
      </Body>
    </Html>
  );
};
