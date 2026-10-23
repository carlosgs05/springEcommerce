import { useState, ChangeEvent, FormEvent, useEffect } from "react";
import { Eye, EyeSlash, UserCircle } from "@phosphor-icons/react";
import axios from "axios";
import { api } from "@/lib/api";
import Swal from "sweetalert2";
import { useAuth } from '@/context/AuthContext';
import { FieldError, fieldAria } from '@/components/FieldError';
import { useCambiarCorreo, idCorreo } from '@/autenticacion/useCambiarCorreo';
import { PASSWORD_HINT, PASSWORD_RE, fieldErrorsDe, flagInvalid } from '@/autenticacion/formUtils';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { FormField, Input } from '@/components/ui/FormField';

interface UserData {
  nombre: string;
  apellido: string;
  celular: string;
  dni: string;
  correo: string;
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

type Errores = Partial<Record<keyof UserData, string>>;
// Orden visual de los campos (para enfocar el primero con error)
const ORDEN: (keyof UserData)[] = ['nombre', 'apellido', 'celular', 'currentPassword', 'newPassword', 'confirmPassword'];

const PerfilUser = () => {
  const { user, updateUser, setAuthToken } = useAuth();
  const correo = useCambiarCorreo();
  const [userData, setUserData] = useState<UserData>({
    nombre: "",
    apellido: "",
    celular: "",
    dni: "",
    correo: "",
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [showPassword, setShowPassword] = useState({ current: false, new: false, confirm: false });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Errores>({});

  useEffect(() => {
    if (user) {
      // Las contraseñas escritas se conservan: updateUser cambia `user` a mitad del envío
      setUserData(prev => ({
        ...prev,
        nombre: user.nombre,
        apellido: user.apellido,
        celular: user.celular || "",
        dni: user.dni || "",
        correo: user.correo,
      }));
    }
  }, [user]);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setUserData(prev => ({
      ...prev,
      [name]: value,
    }));
    setErrors(prev => ({ ...prev, [name]: undefined }));
  };

  const mostrarErrores = (found: Errores) => {
    setErrors(found);
    flagInvalid(ORDEN.filter(k => found[k]));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    const found: Errores = {};
    if (!userData.nombre.trim()) found.nombre = 'Escribe tu nombre.';
    if (!userData.apellido.trim()) found.apellido = 'Escribe tu apellido.';
    if (userData.newPassword) {
      if (!userData.currentPassword) found.currentPassword = 'Escribe tu contraseña actual para poder cambiarla.';
      if (!PASSWORD_RE.test(userData.newPassword)) found.newPassword = PASSWORD_HINT;
      if (userData.newPassword !== userData.confirmPassword) found.confirmPassword = 'Las contraseñas no coinciden. Escríbelas igual en los dos campos.';
    }
    if (Object.keys(found).length > 0) {
      mostrarErrores(found);
      return;
    }
    setErrors({});
    setIsSubmitting(true);

    try {
      // Sin correo: el servidor edita la cuenta de la sesión
      const updateData = {
        nombre: userData.nombre,
        apellido: userData.apellido,
        celular: userData.celular
      };

      const response = await api.put('/api/auth/update-user', updateData);
      const datosGuardados = response.data.statusCode === 200;
      // Lo que ya se guardó se refleja aunque el cambio de contraseña falle después
      if (datosGuardados) updateUser(response.data.usuario);

      let passwordChanged = false;
      if (userData.newPassword) {
        const pw =await api.put('/api/auth/change-password', {
          currentPassword: userData.currentPassword,
          newPassword: userData.newPassword,
          confirmPassword: userData.confirmPassword
        });
        // Las sesiones anteriores quedan invalidadas: se guarda el token nuevo
        if (pw.data?.token) setAuthToken(pw.data.token);
        passwordChanged = true;
      }

      if (datosGuardados) {
        Swal.fire({
          title: 'Éxito',
          text: passwordChanged ? 'Datos y contraseña actualizados correctamente' : 'Datos actualizados correctamente',
          icon: 'success'
        });
        setUserData(prev => ({ ...prev, currentPassword: '', newPassword: '', confirmPassword: '' }));
      }
    } catch (error) {
      // Error de validación del servidor: va junto a su campo (si falla change-password, en ese campo)
      const fe = fieldErrorsDe(error);
      const found: Errores = {};
      for (const k of ORDEN) if (fe[k]) found[k] = fe[k];
      if (Object.keys(found).length > 0) {
        mostrarErrores(found);
        return;
      }
      const errorMessage = axios.isAxiosError(error) && error.response?.data?.message
        ? error.response.data.message
        : 'Error en la operación';
      Swal.fire({ title: 'Error', text: errorMessage, icon: 'error' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const togglePasswordVisibility = (field: 'current' | 'new' | 'confirm') => {
    setShowPassword(prev => ({ ...prev, [field]: !prev[field] }));
  };

  return (
    <div className="min-h-screen flex flex-col">
      <section className="flex-grow bg-canvas py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <form onSubmit={handleSubmit} noValidate className="space-y-8">
            <Card elevation={2} padding="lg">
              <div className="flex items-center gap-6 mb-2">
                <div className="w-24 h-24 rounded-full bg-primary/15 flex items-center justify-center overflow-hidden shrink-0">
                  <UserCircle className="text-6xl text-primary" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-text">
                    {userData.nombre} {userData.apellido}
                  </h2>
                  <p className="text-text-muted break-all">{userData.correo}</p>
                  <Badge variant="success" size="sm" className="mt-2">Cliente</Badge>
                </div>
              </div>
            </Card>

            <Card elevation={1} padding="lg">
              <CardHeader>
                <h2 className="text-xl font-semibold text-text">
                  Información Personal
                </h2>
              </CardHeader>
              <CardBody className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField label="Nombre" required error={errors.nombre}>
                  {(ctrl) => (
                    <Input
                      {...ctrl}
                      name="nombre"
                      value={userData.nombre}
                      onChange={handleChange}
                    />
                  )}
                </FormField>
                <FormField label="Apellido" required error={errors.apellido}>
                  {(ctrl) => (
                    <Input
                      {...ctrl}
                      name="apellido"
                      value={userData.apellido}
                      onChange={handleChange}
                    />
                  )}
                </FormField>
                <FormField label="Teléfono" error={errors.celular}>
                  {(ctrl) => (
                    <Input
                      {...ctrl}
                      type="tel"
                      name="celular"
                      value={userData.celular}
                      onChange={handleChange}
                    />
                  )}
                </FormField>
                <FormField label="DNI">
                  {(ctrl) => (
                    <Input
                      {...ctrl}
                      name="dni"
                      value={userData.dni}
                      disabled
                    />
                  )}
                </FormField>
              </CardBody>
            </Card>

            <Card elevation={1} padding="lg">
              <CardHeader>
                <h2 className="text-xl font-semibold text-text">
                  Seguridad
                </h2>
              </CardHeader>
              <CardBody className="space-y-6">
                <FormField label="Correo Electrónico (se cambia en «Cambiar correo», más abajo)">
                  {() => (
                    <Input
                      type="email"
                      id="correo"
                      name="correo"
                      value={userData.correo}
                      disabled
                    />
                  )}
                </FormField>

                <div className="border-t border-border pt-6 space-y-6">
                  <div>
                    <label htmlFor="currentPassword" className="font-body text-sm font-semibold text-text mb-1.5 block">Contraseña Actual</label>
                    <div className="relative">
                      <Input
                        type={showPassword.current ? "text" : "password"}
                        name="currentPassword"
                        {...fieldAria("currentPassword", errors.currentPassword)}
                        value={userData.currentPassword}
                        onChange={handleChange}
                        autoComplete="current-password"
                        className="pr-12"
                      />
                      <button
                        type="button"
                        onClick={() => togglePasswordVisibility('current')}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-primary cursor-pointer"
                        aria-label={showPassword.current ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                      >
                        {showPassword.current ? <EyeSlash /> : <Eye />}
                      </button>
                    </div>
                    <FieldError id="currentPassword" error={errors.currentPassword} />
                  </div>

                  <div>
                    <label htmlFor="newPassword" className="font-body text-sm font-semibold text-text mb-1.5 block">Nueva Contraseña</label>
                    <div className="relative">
                      <Input
                        type={showPassword.new ? "text" : "password"}
                        name="newPassword"
                        {...fieldAria("newPassword", errors.newPassword)}
                        value={userData.newPassword}
                        onChange={handleChange}
                        className="pr-12"
                      />
                      <button
                        type="button"
                        onClick={() => togglePasswordVisibility('new')}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-primary cursor-pointer"
                        aria-label={showPassword.new ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                      >
                        {showPassword.new ? <EyeSlash /> : <Eye />}
                      </button>
                    </div>
                    <FieldError id="newPassword" error={errors.newPassword} />
                  </div>

                  <div>
                    <label htmlFor="confirmPassword" className="font-body text-sm font-semibold text-text mb-1.5 block">Confirmar Nueva Contraseña</label>
                    <div className="relative">
                      <Input
                        type={showPassword.confirm ? "text" : "password"}
                        name="confirmPassword"
                        {...fieldAria("confirmPassword", errors.confirmPassword)}
                        value={userData.confirmPassword}
                        onChange={handleChange}
                        className="pr-12"
                      />
                      <button
                        type="button"
                        onClick={() => togglePasswordVisibility('confirm')}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-primary cursor-pointer"
                        aria-label={showPassword.confirm ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                      >
                        {showPassword.confirm ? <EyeSlash /> : <Eye />}
                      </button>
                    </div>
                    <FieldError id="confirmPassword" error={errors.confirmPassword} />
                  </div>
                </div>
              </CardBody>
            </Card>

            <div className="flex justify-end gap-4">
              <Button type="button" variant="secondary">
                Cancelar
              </Button>
              <Button type="submit" variant="primary" loading={isSubmitting}>
                Guardar Cambios
              </Button>
            </div>
          </form>

          <Card elevation={1} padding="lg" className="mt-8">
            <form onSubmit={correo.paso === 1 ? correo.pedirCodigo : correo.confirmar} noValidate className="space-y-6">
              <h2 className="text-xl font-semibold text-text">Cambiar correo</h2>
              {correo.aviso && (
                <p role="status" className="rounded-lg bg-primary/10 border border-primary/20 px-4 py-3 text-sm text-text">{correo.aviso}</p>
              )}
              {correo.paso === 1 ? (
                <>
                  <FormField label="Correo nuevo" error={correo.errors.newCorreo}>
                    {() => (
                      <Input
                        type="email"
                        name="newCorreo"
                        inputMode="email"
                        autoComplete="email"
                        {...fieldAria(idCorreo("newCorreo"), correo.errors.newCorreo)}
                        value={correo.valores.newCorreo}
                        onChange={correo.handleChange}
                      />
                    )}
                  </FormField>
                  <FormField label="Contraseña actual" error={correo.errors.currentPassword}>
                    {() => (
                      <Input
                        type="password"
                        name="currentPassword"
                        autoComplete="current-password"
                        {...fieldAria(idCorreo("currentPassword"), correo.errors.currentPassword)}
                        value={correo.valores.currentPassword}
                        onChange={correo.handleChange}
                      />
                    )}
                  </FormField>
                </>
              ) : (
                  <FormField label="Código de 6 dígitos enviado al correo nuevo" error={correo.errors.emailCode}>
                    {() => (
                      <Input
                        type="text"
                        name="emailCode"
                        inputMode="numeric"
                        autoComplete="one-time-code"
                        maxLength={6}
                        {...fieldAria(idCorreo("emailCode"), correo.errors.emailCode)}
                        value={correo.valores.emailCode}
                        onChange={correo.handleChange}
                      />
                    )}
                  </FormField>
              )}
              {correo.paso === 2 && (
                <p className="text-sm text-text-muted break-all">Correo nuevo: <strong>{correo.valores.newCorreo}</strong></p>
              )}
              <div className="flex flex-wrap justify-end gap-4">
                {correo.paso === 2 && (
                  <Button type="button" variant="secondary" onClick={correo.volver}>
                    Pedir otro código
                  </Button>
                )}
                <Button type="submit" variant="primary" loading={correo.loading}>
                  {correo.paso === 1 ? 'Enviar código' : 'Confirmar correo'}
                </Button>
              </div>
            </form>
          </Card>
        </div>
      </section>
    </div>
  );
};

export default PerfilUser;
