"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { PatternFormat } from "react-number-format";
import { toast } from "sonner";
import z from "zod";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { shippingAddressTable } from "@/db/schema";
import { useCalculateShipping } from "@/hooks/mutations/use-calculate-shipping";
import { useCreateShippingAddress } from "@/hooks/mutations/use-create-shipping-address";
import { useUpdateCartShippingAddress } from "@/hooks/mutations/use-update-cart-shipping-address";
import { useUserAddresses } from "@/hooks/queries/use-user-addresses";

import { formatAddress } from "../../helpers/address";
import ShippingOptions from "./shipping-options";

const formSchema = z.object({
  email: z.email("E-mail inválido"),
  fullName: z.string().min(1, "Nome completo é obrigatório"),
  cpf: z.string().min(14, "CPF inválido"),
  phone: z.string().min(15, "Celular inválido"),
  zipCode: z.string().min(9, "CEP inválido"),
  address: z.string().min(1, "Endereço é obrigatório"),
  number: z.string().min(1, "Número é obrigatório"),
  complement: z.string().optional(),
  neighborhood: z.string().min(1, "Bairro é obrigatório"),
  city: z.string().min(1, "Cidade é obrigatória"),
  state: z.string().min(1, "Estado é obrigatório"),
});

type FormValues = z.infer<typeof formSchema>;

interface AddressesProps {
  shippingAddresses: (typeof shippingAddressTable.$inferSelect)[];
  defaultShippingAddressId: string | null;
  initialShippingServiceId: string | null;
}

const normalizePostalCode = (postalCode: string) =>
  postalCode.replace(/\D/g, "");

const getStateAbbr = (state: string) => state.trim().slice(0, 2).toUpperCase();

const Addresses = ({
  shippingAddresses,
  defaultShippingAddressId,
  initialShippingServiceId,
}: AddressesProps) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [selectedAddress, setSelectedAddress] = useState<string | null>(
    defaultShippingAddressId || null,
  );
  const [selectedShippingServiceId, setSelectedShippingServiceId] = useState<
    string | null
  >(initialShippingServiceId);
  const [shippingOptions, setShippingOptions] = useState<
    { id: string; name: string; price: number; delivery_time: number | null }[]
  >([]);
  const [isShippingSaving, setIsShippingSaving] = useState(false);
  const [isShippingSaved, setIsShippingSaved] = useState(
    Boolean(initialShippingServiceId),
  );
  const [isAddressSaved, setIsAddressSaved] = useState(
    Boolean(defaultShippingAddressId),
  );
  const [isProceedLoading, setIsProceedLoading] = useState(false);

  const calculateShippingMutation = useCalculateShipping();
  const createShippingAddressMutation = useCreateShippingAddress();
  const updateCartShippingAddressMutation = useUpdateCartShippingAddress();
  const { data: addresses, isLoading } = useUserAddresses({
    initialData: shippingAddresses,
  });

  const runShippingCalculation = async (
    address: typeof shippingAddressTable.$inferSelect,
  ) => {
    try {
      const options = await calculateShippingMutation.mutateAsync({
        to: {
          postal_code: normalizePostalCode(address.zipCode),
          address: address.street,
          number: address.number,
          city: address.city,
          state_abbr: getStateAbbr(address.state),
        },
      });

      setShippingOptions(options);
      console.log("🚚 Shipping options loaded:", options);

      if (!options.some((option) => option.id === selectedShippingServiceId)) {
        setSelectedShippingServiceId(null);
        setIsShippingSaved(false);
      } else if (selectedShippingServiceId) {
        setIsShippingSaved(true);
      }

      if (options.length === 0) {
        toast.error("Não foi possível calcular o frete para este endereço.");
      }
    } catch (error) {
      console.error("[Addresses] Erro ao calcular frete:", error);
      setShippingOptions([]);
      setSelectedShippingServiceId(null);
      toast.error("Erro ao calcular frete. Tente novamente.");
    }
  };

  useEffect(() => {
    if (searchParams.get("shippingRequired") === "1") {
      toast.error("Selecione uma opção de frete");
    }
  }, [searchParams]);

  useEffect(() => {
    if (!selectedAddress || selectedAddress === "add_new") {
      setShippingOptions([]);
      setSelectedShippingServiceId(null);
      setIsShippingSaved(false);
      setIsAddressSaved(false);
      return;
    }

    const address = addresses?.find((item) => item.id === selectedAddress);
    if (!address) {
      return;
    }

    const persistAndCalculate = async () => {
      try {
        setIsAddressSaved(false);
        setIsShippingSaved(false);

        await updateCartShippingAddressMutation.mutateAsync({
          shippingAddressId: selectedAddress,
        });

        setIsAddressSaved(true);
        await runShippingCalculation(address);
      } catch (error) {
        console.error(
          "[Addresses] Erro ao salvar endereço no carrinho:",
          error,
        );
        toast.error("Erro ao salvar endereço para entrega.");
      }
    };

    persistAndCalculate();
  }, [selectedAddress, addresses]);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      fullName: "",
      cpf: "",
      phone: "",
      zipCode: "",
      address: "",
      number: "",
      complement: "",
      neighborhood: "",
      city: "",
      state: "",
    },
  });

  const onSubmit = async (values: FormValues) => {
    try {
      const newAddress =
        await createShippingAddressMutation.mutateAsync(values);
      toast.success("Endereço criado com sucesso!");
      form.reset();
      setSelectedAddress(newAddress.id);
    } catch (error) {
      toast.error("Erro ao criar endereço. Tente novamente.");
      console.error(error);
    }
  };

  const canProceedToPayment =
    Boolean(selectedAddress && selectedAddress !== "add_new") &&
    isAddressSaved &&
    shippingOptions.length > 0 &&
    Boolean(selectedShippingServiceId) &&
    isShippingSaved &&
    !isShippingSaving &&
    !calculateShippingMutation.isPending &&
    !updateCartShippingAddressMutation.isPending &&
    !isProceedLoading;

  const handleGoToPayment = async () => {
    if (!canProceedToPayment) {
      toast.error("Selecione uma opção de frete para continuar.");
      return;
    }

    try {
      setIsProceedLoading(true);
      router.push("/cart/confirmation");
    } catch (error) {
      toast.error("Erro ao selecionar endereço. Tente novamente.");
      console.error(error);
    } finally {
      setIsProceedLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Identificação</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="py-4 text-center">
            <p>Carregando endereços...</p>
          </div>
        ) : (
          <RadioGroup
            value={selectedAddress}
            onValueChange={setSelectedAddress}
          >
            {addresses?.length === 0 && (
              <div className="py-4 text-center">
                <p className="text-muted-foreground">
                  Você ainda não possui endereços cadastrados.
                </p>
              </div>
            )}

            {addresses?.map((address) => (
              <Card key={address.id}>
                <CardContent>
                  <div className="flex items-start space-x-2">
                    <RadioGroupItem value={address.id} id={address.id} />
                    <div className="flex-1">
                      <Label htmlFor={address.id} className="cursor-pointer">
                        <div>
                          <p className="text-sm">{formatAddress(address)}</p>
                        </div>
                      </Label>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}

            <Card>
              <CardContent>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="add_new" id="add_new" />
                  <Label htmlFor="add_new">Adicionar novo endereço</Label>
                </div>
              </CardContent>
            </Card>
          </RadioGroup>
        )}

        {selectedAddress && selectedAddress !== "add_new" && (
          <div className="mt-4 space-y-4">
            {calculateShippingMutation.isPending ? (
              <p className="text-muted-foreground text-sm">
                Calculando opções de frete...
              </p>
            ) : (
              <ShippingOptions
                options={shippingOptions}
                selectedServiceId={selectedShippingServiceId}
                onSelectedServiceIdChange={(serviceId) => {
                  setSelectedShippingServiceId(serviceId);
                  setIsShippingSaved(false);
                }}
                onShippingSavingChange={setIsShippingSaving}
                onShippingSaved={({ serviceId }) => {
                  setSelectedShippingServiceId(serviceId);
                  setIsShippingSaved(true);
                }}
              />
            )}

            <Button
              onClick={handleGoToPayment}
              className="w-full"
              disabled={!canProceedToPayment}
            >
              {isProceedLoading || isShippingSaving
                ? "Salvando frete..."
                : "Ir para pagamento"}
            </Button>
          </div>
        )}

        {selectedAddress === "add_new" && (
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="mt-4 space-y-4"
            >
              <div className="grid gap-4 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input placeholder="Digite seu email" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="fullName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nome completo</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Digite seu nome completo"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="cpf"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>CPF</FormLabel>
                      <FormControl>
                        <PatternFormat
                          format="###.###.###-##"
                          placeholder="000.000.000-00"
                          customInput={Input}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Celular</FormLabel>
                      <FormControl>
                        <PatternFormat
                          format="(##) #####-####"
                          placeholder="(11) 99999-9999"
                          customInput={Input}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="zipCode"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>CEP</FormLabel>
                      <FormControl>
                        <PatternFormat
                          format="#####-###"
                          placeholder="00000-000"
                          customInput={Input}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="address"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Endereço</FormLabel>
                      <FormControl>
                        <Input placeholder="Digite seu endereço" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="number"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Número</FormLabel>
                      <FormControl>
                        <Input placeholder="Digite o número" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="complement"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Complemento</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Apto, bloco, etc. (opcional)"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="neighborhood"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Bairro</FormLabel>
                      <FormControl>
                        <Input placeholder="Digite o bairro" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="city"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Cidade</FormLabel>
                      <FormControl>
                        <Input placeholder="Digite a cidade" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="state"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Estado</FormLabel>
                      <FormControl>
                        <Input placeholder="Digite o estado" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <Button
                type="submit"
                className="w-full"
                disabled={
                  createShippingAddressMutation.isPending ||
                  updateCartShippingAddressMutation.isPending
                }
              >
                {createShippingAddressMutation.isPending ||
                updateCartShippingAddressMutation.isPending
                  ? "Salvando..."
                  : "Salvar endereço"}
              </Button>
            </form>
          </Form>
        )}
      </CardContent>
    </Card>
  );
};

export default Addresses;
