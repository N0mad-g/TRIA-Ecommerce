import {
  Body,
  Column,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Img,
  Preview,
  Row,
  Section,
  Text,
} from "@react-email/components";

import type { OrderEmailData } from "@/emails/types";
import { formatCentsToBRL } from "@/lib/helpers/money";

type OrderEmailLayoutProps = {
  preview: string;
  title: string;
  message: string;
  order: OrderEmailData;
};

const colors = {
  background: "#f9fafb",
  card: "#ffffff",
  border: "#e5e7eb",
  text: "#111827",
  muted: "#6b7280",
};

const styles = {
  body: {
    backgroundColor: colors.background,
    fontFamily: "Arial, sans-serif",
    margin: 0,
    padding: "24px 0",
  },
  container: {
    backgroundColor: colors.card,
    border: `1px solid ${colors.border}`,
    borderRadius: "12px",
    margin: "0 auto",
    padding: "24px",
    width: "100%",
    maxWidth: "560px",
  },
  title: {
    color: colors.text,
    fontSize: "22px",
    fontWeight: "700",
    margin: "0 0 8px",
  },
  message: {
    color: colors.muted,
    fontSize: "14px",
    margin: "0 0 16px",
  },
  orderNumber: {
    color: colors.text,
    fontSize: "16px",
    fontWeight: "700",
    margin: "0 0 8px",
  },
  meta: {
    color: colors.muted,
    fontSize: "12px",
    margin: "0 0 16px",
  },
  sectionTitle: {
    color: colors.text,
    fontSize: "14px",
    fontWeight: "600",
    margin: "0 0 8px",
  },
  itemRow: {
    padding: "8px 0",
  },
  itemImageColumn: {
    width: "80px",
    verticalAlign: "top" as const,
  },
  itemContentColumn: {
    paddingLeft: "12px",
    verticalAlign: "top" as const,
  },
  itemPriceColumn: {
    width: "110px",
    textAlign: "right" as const,
    verticalAlign: "top" as const,
  },
  itemImage: {
    borderRadius: "8px",
    display: "block",
    width: "80px",
    height: "80px",
    objectFit: "cover" as const,
  },
  itemName: {
    color: colors.text,
    fontSize: "14px",
    margin: 0,
  },
  itemMeta: {
    color: colors.muted,
    fontSize: "12px",
    margin: 0,
  },
  itemPrice: {
    color: colors.text,
    fontSize: "14px",
    textAlign: "right" as const,
    margin: 0,
  },
  totalLabel: {
    color: colors.muted,
    fontSize: "12px",
    margin: 0,
  },
  totalValue: {
    color: colors.text,
    fontSize: "16px",
    fontWeight: "700",
    margin: 0,
    textAlign: "right" as const,
  },
  divider: {
    borderColor: colors.border,
    margin: "16px 0",
  },
  footer: {
    color: colors.muted,
    fontSize: "12px",
    margin: "16px 0 0",
    textAlign: "center" as const,
  },
};

const getAbsoluteImageUrl = (imageUrl: string) => {
  if (!imageUrl.startsWith("/")) {
    return imageUrl;
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "");
  if (!appUrl) {
    return imageUrl;
  }

  return `${appUrl}${imageUrl}`;
};

export const OrderEmailLayout = ({
  preview,
  title,
  message,
  order,
}: OrderEmailLayoutProps) => {
  return (
    <Html>
      <Head />
      <Preview>{preview}</Preview>
      <Body style={styles.body}>
        <Container style={styles.container}>
          <Heading style={styles.title}>{title}</Heading>
          <Text style={styles.orderNumber}>Pedido #{order.shortId}</Text>
          <Text style={styles.message}>{message}</Text>
          <Text style={styles.meta}>{order.customerName}</Text>

          <Section>
            <Text style={styles.sectionTitle}>Items</Text>
            {order.items.map((item, index) => (
              <Row key={`${order.shortId}-${index}`} style={styles.itemRow}>
                <Column style={styles.itemImageColumn}>
                  <Img
                    src={getAbsoluteImageUrl(item.imageUrl)}
                    width={80}
                    height={80}
                    alt={item.name}
                    style={styles.itemImage}
                  />
                </Column>
                <Column style={styles.itemContentColumn}>
                  <Text style={styles.itemName}>{item.name}</Text>
                  <Text style={styles.itemMeta}>Qty {item.quantity}</Text>
                </Column>
                <Column style={styles.itemPriceColumn}>
                  <Text style={styles.itemPrice}>
                    {formatCentsToBRL(item.priceInCents * item.quantity)}
                  </Text>
                </Column>
              </Row>
            ))}
          </Section>

          <Hr style={styles.divider} />

          <Section>
            {/* Subtotal */}
            <Row>
              <Column>
                <Text style={styles.totalLabel}>Subtotal</Text>
              </Column>
              <Column>
                <Text style={styles.totalValue}>
                  {formatCentsToBRL(
                    order.totalPriceInCents - order.shippingCostInCents,
                  )}
                </Text>
              </Column>
            </Row>

            {/* Shipping */}
            <Row style={{ paddingTop: "8px" }}>
              <Column>
                <Text style={styles.totalLabel}>
                  {order.shippingCostInCents > 0
                    ? `Frete (${order.shippingMethod || "SEDEX"})`
                    : "Frete"}
                </Text>
              </Column>
              <Column>
                <Text
                  style={{
                    ...styles.totalValue,
                    color:
                      order.shippingCostInCents === 0 ? "#10b981" : colors.text,
                  }}
                >
                  {order.shippingCostInCents > 0
                    ? formatCentsToBRL(order.shippingCostInCents)
                    : "GRÁTIS"}
                </Text>
              </Column>
            </Row>

            <Hr style={styles.divider} />

            {/* Total */}
            <Row>
              <Column>
                <Text style={styles.totalLabel}>Total</Text>
              </Column>
              <Column>
                <Text style={styles.totalValue}>
                  {formatCentsToBRL(order.totalPriceInCents)}
                </Text>
              </Column>
            </Row>
          </Section>

          <Hr style={styles.divider} />

          <Text style={styles.footer}>
            Studio Montenegro • contato@studiomontenegro.com.br
          </Text>
        </Container>
      </Body>
    </Html>
  );
};
