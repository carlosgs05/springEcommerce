import { useState } from "react";
import {
  Badge,
  Button,
  Card,
  CardBody,
  CardFooter,
  CardHeader,
  FormField,
  Input,
  Select,
  Textarea,
} from "../components/ui";

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <Card as="section" elevation={1}>
      <CardHeader>
        <h2 className="text-lg font-semibold">{title}</h2>
      </CardHeader>
      <CardBody className="flex flex-col gap-4">{children}</CardBody>
    </Card>
  );
}

export function UiShowcase() {
  const [dark, setDark] = useState(() =>
    document.documentElement.classList.contains("dark"),
  );
  const [loading, setLoading] = useState(false);

  const toggleDark = () => {
    const next = !dark;
    document.documentElement.classList.toggle("dark", next);
    setDark(next);
  };

  const fakeSubmit = () => {
    setLoading(true);
    setTimeout(() => setLoading(false), 2000);
  };

  return (
    <div className="min-h-screen bg-canvas text-text">
      <div className="mx-auto max-w-7xl p-4 sm:p-6 lg:p-8">
        <header className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <h1 className="text-2xl font-bold sm:text-3xl">TechStore · UI base</h1>
          <Button variant="secondary" onClick={toggleDark} aria-pressed={dark}>
            {dark ? "Modo claro" : "Modo oscuro"}
          </Button>
        </header>

        <div className="grid grid-cols-1 gap-4 sm:gap-6 md:grid-cols-2 lg:grid-cols-3">
          <Section title="Botones: variantes">
            <div className="flex flex-wrap gap-3">
              <Button>Primario</Button>
              <Button variant="secondary">Secundario</Button>
              <Button variant="danger">Peligro</Button>
              <Button variant="ghost">Fantasma</Button>
            </div>
          </Section>

          <Section title="Botones: tamaños e iconos">
            <div className="flex flex-wrap items-center gap-3">
              <Button size="sm">Pequeño</Button>
              <Button size="md">Mediano</Button>
              <Button size="lg">Grande</Button>
            </div>
            <div className="flex flex-wrap gap-3">
              <Button leftIcon={<span aria-hidden="true">+</span>}>Agregar</Button>
              <Button variant="secondary" rightIcon={<span aria-hidden="true">→</span>}>
                Siguiente
              </Button>
            </div>
            <Button fullWidth>Ancho completo</Button>
          </Section>

          <Section title="Botones: estados">
            <div className="flex flex-wrap gap-3">
              <Button loading={loading} onClick={fakeSubmit}>
                {loading ? "Guardando" : "Guardar (2 s)"}
              </Button>
              <Button loading>Cargando fijo</Button>
              <Button disabled>Deshabilitado</Button>
              <Button variant="secondary" disabled>
                Deshabilitado
              </Button>
              <Button variant="danger" disabled>
                Deshabilitado
              </Button>
            </div>
          </Section>

          <Section title="Badges">
            <div className="flex flex-wrap gap-2">
              <Badge variant="success">Pagado</Badge>
              <Badge variant="warning">Pendiente</Badge>
              <Badge variant="danger">Cancelado</Badge>
              <Badge variant="info">Enviado</Badge>
              <Badge variant="neutral">Borrador</Badge>
            </div>
            <div className="flex flex-wrap gap-2">
              <Badge size="sm" dot variant="success">En stock</Badge>
              <Badge size="sm" dot variant="warning">Pocas unidades</Badge>
              <Badge size="sm" dot variant="danger">Agotado</Badge>
              <Badge size="sm" dot variant="info">Nuevo</Badge>
              <Badge size="sm" dot>Sin estado</Badge>
            </div>
          </Section>

          <Section title="Formulario">
            <FormField label="Correo" required helperText="Usaremos este correo para tu pedido.">
              {(c) => <Input type="email" autoComplete="email" {...c} />}
            </FormField>
            <FormField label="Teléfono" required error="Ingresa 9 dígitos, por ejemplo 987654321.">
              {(c) => <Input type="tel" autoComplete="tel" defaultValue="98765" {...c} />}
            </FormField>
            <FormField label="Departamento">
              {(c) => (
                <Select {...c} defaultValue="">
                  <option value="" disabled>Selecciona uno</option>
                  <option>Lima</option>
                  <option>Arequipa</option>
                  <option>Cusco</option>
                </Select>
              )}
            </FormField>
            <FormField label="Comentarios" helperText="Opcional.">
              {(c) => <Textarea {...c} />}
            </FormField>
            <FormField label="Campo deshabilitado">
              {(c) => <Input disabled defaultValue="No editable" {...c} />}
            </FormField>
          </Section>

          <Section title="Cards: elevaciones">
            <div className="flex flex-col gap-4 p-1">
              <Card elevation={1} padding="sm">Elevación 1</Card>
              <Card elevation={2} padding="sm">Elevación 2</Card>
              <Card elevation={3} padding="sm">Elevación 3</Card>
            </div>
          </Section>

          <Section title="Card interactiva">
            <Card interactive elevation={1} as="article" tabIndex={0}>
              <CardHeader>
                <h3 className="font-semibold text-text">Laptop Pro 14&quot;</h3>
                <Badge size="sm" dot variant="success">En stock</Badge>
              </CardHeader>
              <CardBody>Pasa el cursor o enfoca con Tab: sube de elevación.</CardBody>
              <CardFooter>
                <Button size="sm">Ver detalle</Button>
              </CardFooter>
            </Card>
          </Section>

          <Section title="Card: paddings">
            <Card padding="none">none</Card>
            <Card padding="sm">sm</Card>
            <Card padding="md">md</Card>
            <Card padding="lg">lg</Card>
          </Section>
        </div>
      </div>
    </div>
  );
}
