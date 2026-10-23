import React, { useState, ChangeEvent, FormEvent, useEffect } from 'react';
import { Eye, EyeSlash, UserCircle } from '@phosphor-icons/react';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';
import { api } from '../../lib/api';
import Swal from 'sweetalert2';
import { FieldError, fieldAria } from '../../components/FieldError';
import { useCambiarCorreo, idCorreo } from '../../autenticacion/useCambiarCorreo';
import { PASSWORD_HINT, PASSWORD_RE, fieldErrorsDe, flagInvalid } from '../../autenticacion/formUtils';
import { Card, CardHeader, CardFooter } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { FormField, Input } from '../../components/ui/FormField';

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

const PerfilAdmin: React.FC = () => {
  const { user, updateUser, setAuthToken } = useAuth();
  const correo = useCambiarCorreo();
  const [userData, setUserData] = useState<UserData>({
    nombre: '',
    apellido: '',
    celular: '',
    dni: '',
    correo: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [showPassword, setShowPassword] = useState({ current: false, new: false, confirm: false });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Errores>({});
  const [activeSection, setActiveSection] = useState<'personal' | 'security'>('personal');

  useEffect(() => {
    if (user) {
      setUserData({
        nombre: user.nombre,
        apellido: user.apellido,
        celular: user.celular || '',
        dni: user.dni || '',
        correo: user.correo,
        currentPassword: '',
            newPassword: '',
        confirmPassword: '',
      });
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
    if (activeSection === 'security') {
      if (!userData.currentPassword) found.currentPassword = 'Escribe tu contraseña actual para poder cambiarla.';
      if (!PASSWORD_RE.test(userData.newPassword)) found.newPassword = PASSWORD_HINT;
      if (userData.newPassword !== userData.confirmPassword) found.confirmPassword = 'Las contraseñas no coinciden. Escríbelas igual en los dos campos.';
    } else {
      if (!userData.nombre.trim()) found.nombre = 'Escribe tu nombre.';
      if (!userData.apellido.trim()) found.apellido = 'Escribe tu apellido.';
    }
    if (Object.keys(found).length > 0) {
      mostrarErrores(found);
      return;
    }
    setErrors({});
    setIsSubmitting(true);

    try {
      if (activeSection === 'security') {
        const response = await api.put('/api/auth/change-password', {
          currentPassword: userData.currentPassword,
          newPassword: userData.newPassword,
          confirmPassword: userData.confirmPassword
        });

        if (response.data.statusCode === 200) {
          // Las sesiones anteriores quedan invalidadas: se guarda el token nuevo
          if (response.data.token) setAuthToken(response.data.token);
          Swal.fire({ title: 'Éxito', text: 'Contraseña actualizada correctamente', icon: 'success' });
          setUserData(prev => ({ ...prev, currentPassword: '', newPassword: '', confirmPassword: '' }));
        }
      } else {
        // Sin correo: el servidor edita la cuenta de la sesión
        const response = await api.put('/api/auth/update-user', {
          nombre: userData.nombre,
          apellido: userData.apellido,
          celular: userData.celular
        });

        if (response.data.statusCode === 200) {
          updateUser(response.data.usuario);
          Swal.fire({ title: 'Éxito', text: 'Datos actualizados correctamente', icon: 'success' });
        }
      }
    } catch (error) {
      // Error de validación del servidor: va junto a su campo
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

  const togglePasswordVisibility = (field: keyof typeof showPassword) => {
    setShowPassword(prev => ({ ...prev, [field]: !prev[field] }));
  };

  const handleTabChange = (section: 'personal' | 'security') => {
    setActiveSection(section);
  };

  return (
    <div className="flex items-center justify-center min-h-[590px] py-8">
      <Card as="div" elevation={2} padding="none" className="w-full max-w-5xl mx-auto relative">
        {/* Avatar position */}
        <div className="absolute -top-10 left-1/2 transform -translate-x-1/2">
          <div className="w-20 h-20 rounded-full bg-primary/15 flex items-center justify-center border-4 border-surface shadow-md">
            <UserCircle className="w-16 h-16 text-primary" />
          </div>
          <span className="absolute -bottom-1 -right-1">
            <Badge variant="info" size="sm">Administrador</Badge>
          </span>
        </div>

        <div className="pt-16 px-6 pb-6">
          <CardHeader className="text-center mb-6 items-center">
            <h1 className="text-2xl font-bold text-text">
              Configuración de Perfil
            </h1>
            <p className="text-text-muted mt-1">Administra tu información personal y de seguridad</p>
          </CardHeader>

          <div className="flex space-x-4 mb-8 border-b border-border justify-center">
            <button
              onClick={() => handleTabChange('personal')}
              className={`pb-3 px-1 text-base font-medium cursor-pointer transition-all duration-300 ease-in-out relative ${activeSection === 'personal'
                ? 'text-primary font-semibold'
                : 'text-text-muted hover:text-text'
                }`}
            >
              Información Personal
              {activeSection === 'personal' && (
                <span className="absolute bottom-0 left-0 w-full h-0.5 bg-primary rounded-full"></span>
              )}
            </button>
            <button
              onClick={() => handleTabChange('security')}
              className={`pb-3 px-1 text-base font-medium cursor-pointer transition-all duration-300 ease-in-out relative ${activeSection === 'security'
                ? 'text-primary font-semibold'
                : 'text-text-muted hover:text-text'
                }`}
            >
              Seguridad
              {activeSection === 'security' && (
                <span className="absolute bottom-0 left-0 w-full h-0.5 bg-primary rounded-full"></span>
              )}
            </button>
          </div>

          <form onSubmit={handleSubmit} noValidate className="space-y-8 transition-all duration-300 ease-in-out">
            {activeSection === 'personal' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 transition-all duration-300 ease-in-out">
                <div className="space-y-6">
                  <FormField label="Nombre" error={errors.nombre}>
                    {(ctrl) => (
                      <Input
                        {...ctrl}
                        name="nombre"
                        value={userData.nombre}
                        onChange={handleChange}
                      />
                    )}
                  </FormField>
                  <div className="flex flex-col">
                    <label htmlFor="celular" className="font-body text-sm font-semibold text-text mb-1.5">Celular</label>
                    <div className="flex rounded-control shadow-sm w-full">
                      <span className="px-4 inline-flex items-center text-base text-text-muted bg-canvas border border-r-0 border-border rounded-l-control">
                        +51
                      </span>
                      <Input
                        name="celular"
                        {...fieldAria('celular', errors.celular)}
                        value={userData.celular}
                        onChange={handleChange}
                        className="rounded-l-none"
                        placeholder="Ej: 987654321"
                      />
                    </div>
                    <FieldError id="celular" error={errors.celular} />
                  </div>
                </div>

                <div className="space-y-6">
                  <FormField label="Apellido" error={errors.apellido}>
                    {(ctrl) => (
                      <Input
                        {...ctrl}
                        name="apellido"
                        value={userData.apellido}
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
                        placeholder="Ingrese su DNI"
                      />
                    )}
                  </FormField>
                </div>
              </div>
            )}

            {activeSection === 'security' && (
              <div className="space-y-6 transition-all duration-300 ease-in-out pb-4">
                <div className="grid md:grid-cols-2 gap-6">
                  <FormField label="Correo electrónico (se cambia en «Cambiar correo», más abajo)">
                    {(ctrl) => (
                      <Input
                        {...ctrl}
                        name="correo"
                        value={userData.correo}
                        disabled
                      />
                    )}
                  </FormField>
                  <div className="flex flex-col">
                    <label htmlFor="currentPassword" className="font-body text-sm font-semibold text-text mb-1.5">Contraseña actual</label>
                    <div className="relative w-full">
                      <Input
                        type={showPassword.current ? 'text' : 'password'}
                        name="currentPassword"
                        {...fieldAria('currentPassword', errors.currentPassword)}
                        value={userData.currentPassword}
                        onChange={handleChange}
                        autoComplete="current-password"
                        className="pr-12"
                      />
                      <button
                        type="button"
                        onClick={() => togglePasswordVisibility('current')}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-text-muted hover:text-text cursor-pointer"
                        aria-label={showPassword.current ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                      >
                        {showPassword.current ? (
                          <EyeSlash className="w-5 h-5" />
                        ) : (
                          <Eye className="w-5 h-5" />
                        )}
                      </button>
                    </div>
                    <FieldError id="currentPassword" error={errors.currentPassword} />
                  </div>
                </div>

                <div className="border-t border-border pt-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="flex flex-col">
                      <label htmlFor="newPassword" className="font-body text-sm font-semibold text-text mb-1.5">Nueva contraseña</label>
                      <div className="relative w-full">
                        <Input
                          type={showPassword.new ? 'text' : 'password'}
                          name="newPassword"
                          {...fieldAria('newPassword', errors.newPassword)}
                          value={userData.newPassword}
                          onChange={handleChange}
                          className="pr-12"
                        />
                        <button
                          type="button"
                          onClick={() => togglePasswordVisibility('new')}
                          className="absolute right-4 top-1/2 -translate-y-1/2 text-text-muted hover:text-text cursor-pointer"
                          aria-label={showPassword.new ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                        >
                          {showPassword.new ? (
                            <EyeSlash className="w-5 h-5" />
                          ) : (
                            <Eye className="w-5 h-5" />
                          )}
                        </button>
                      </div>
                      <FieldError id="newPassword" error={errors.newPassword} />
                    </div>

                    <div className="flex flex-col">
                      <label htmlFor="confirmPassword" className="font-body text-sm font-semibold text-text mb-1.5">Confirmar contraseña</label>
                      <div className="relative w-full">
                        <Input
                          type={showPassword.confirm ? 'text' : 'password'}
                          name="confirmPassword"
                          {...fieldAria('confirmPassword', errors.confirmPassword)}
                          value={userData.confirmPassword}
                          onChange={handleChange}
                          className="pr-12"
                        />
                        <button
                          type="button"
                          onClick={() => togglePasswordVisibility('confirm')}
                          className="absolute right-4 top-1/2 -translate-y-1/2 text-text-muted hover:text-text cursor-pointer"
                          aria-label={showPassword.confirm ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                        >
                          {showPassword.confirm ? (
                            <EyeSlash className="w-5 h-5" />
                          ) : (
                            <Eye className="w-5 h-5" />
                          )}
                        </button>
                      </div>
                      <FieldError id="confirmPassword" error={errors.confirmPassword} />
                    </div>
                  </div>
                </div>

              </div>
            )}

            <CardFooter className="justify-center">
              <Button type="button" variant="danger">
                Cancelar
              </Button>
              <Button type="submit" variant="primary" loading={isSubmitting}>
                Guardar cambios
              </Button>
            </CardFooter>
          </form>

          {activeSection === 'security' && (
          <form onSubmit={correo.paso === 1 ? correo.pedirCodigo : correo.confirmar} noValidate className="mt-8 pt-6 border-t border-border space-y-6">
            <h2 className="text-base font-semibold text-text">Cambiar correo</h2>
            {correo.aviso && (
              <p role="status" className="rounded-xl bg-primary/10 border border-primary/20 px-4 py-3 text-sm text-text">{correo.aviso}</p>
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
          )}
        </div>
      </Card>
    </div>
  );
};

export default PerfilAdmin;
