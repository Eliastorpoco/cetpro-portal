
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { ExternalLink, BookOpen, Monitor, Lock, AlertTriangle, Mail, KeyRound } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Label } from "@/components/ui/label";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useToast } from "@/hooks/use-toast";

const AulaVirtual = () => {
  const [showAuthDialog, setShowAuthDialog] = useState(false);
  const [isError, setIsError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const { toast } = useToast();
  
  // Definir el esquema de validación para el formulario
  const formSchema = z.object({
    email: z.string().email("Debe ser un correo electrónico válido").refine(
      (email) => email.endsWith("@cetpropromaemagdalena.edu.pe"), 
      { message: "Debe usar su correo institucional (@cetpropromaemagdalena.edu.pe)" }
    ),
    password: z.string().min(6, "La contraseña debe tener al menos 6 caracteres"),
  });
  
  // URL base de autenticación de Google
  const googleAuthUrl = "https://accounts.google.com";
  
  // URLs institucionales con el AccountChooser de Google para forzar la autenticación
  const institutionalClassroomUrl = "https://accounts.google.com/AccountChooser?continue=https://classroom.google.com";
  // URL para acceder al correo Gmail institucional con AccountChooser
  const institutionalGmailUrl = "https://accounts.google.com/AccountChooser?continue=https://mail.google.com";
  
  const platforms = [
    {
      id: 1,
      name: "Moodle",
      description: "Nuestra plataforma principal de aprendizaje virtual. Accede a todos los cursos, materiales y actividades.",
      url: "https://cetpropromaemagdalena.edu.pe/intranet/moodle",
      icon: <BookOpen className="h-10 w-10" />
    },
    {
      id: 2,
      name: "Google Classroom",
      description: "Acceso restringido solo para estudiantes con correo institucional. Inicie sesión con sus credenciales institucionales.",
      url: institutionalClassroomUrl,
      icon: <Monitor className="h-10 w-10" />,
      requiresAuth: true
    }
  ];

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const handlePlatformAccess = (platform) => {
    if (platform.requiresAuth) {
      setShowAuthDialog(true);
      setIsError(false);
      form.reset();
    } else {
      window.open(platform.url, "_blank");
    }
  };

  const onSubmit = async (values) => {
    console.log("Intentando iniciar sesión con:", values);
    
    // Verificar que el correo sea institucional
    if (!values.email.endsWith('@cetpropromaemagdalena.edu.pe')) {
      setIsError(true);
      setErrorMessage("Debe usar su correo institucional (@cetpropromaemagdalena.edu.pe)");
      return;
    }
    
    setIsAuthenticating(true);
    setIsError(false);
    
    try {
      // Mostramos mensaje informativo
      toast({
        title: "Redirigiendo a Google",
        description: "Se abrirá la página de autenticación de Google...",
        duration: 3000,
      });
      
      // Primero abrimos la página de autenticación de Google
      window.open(googleAuthUrl, "_blank");
      
      // Luego abrimos directamente las URLs con AccountChooser
      setTimeout(() => {
        // Abrir Google Classroom después de un breve retraso
        window.open(institutionalClassroomUrl, "_blank");
      }, 1500);
      
      setShowAuthDialog(false);
      form.reset();
    } catch (error) {
      console.error("Error de redirección:", error);
      setIsError(true);
      setErrorMessage("Error al intentar redireccionar. Por favor, intente más tarde.");
    } finally {
      setIsAuthenticating(false);
    }
  };

  // Función para abrir directamente el diálogo de login institucional
  const openInstitutionalLogin = () => {
    setShowAuthDialog(true);
    setIsError(false);
    form.reset();
  };

  return (
    <div className="min-h-screen pt-20 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-3xl md:text-4xl font-bold text-cetpro-blue mb-4">Aula Virtual</h1>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Accede a nuestras plataformas de aprendizaje virtual donde encontrarás recursos educativos, actividades y podrás interactuar con profesores y compañeros.
          </p>
        </div>
        
        {/* Botón principal para acceder al correo institucional */}
        <div className="text-center mb-10">
          <Button 
            onClick={() => window.open(googleAuthUrl, "_blank")}
            className="bg-cetpro-blue hover:bg-cetpro-darkblue group"
            size="lg"
          >
            <Mail className="mr-2 h-5 w-5" />
            Acceder a mi correo institucional
            <ExternalLink className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Button>
          <p className="text-sm text-gray-500 mt-2">
            Inicie sesión para acceder a su correo institucional y a Google Classroom
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {platforms.map((platform) => (
            <Card key={platform.id} className="border-2 hover:border-cetpro-blue/50 transition-all duration-300 shadow-lg">
              <CardHeader>
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-full bg-cetpro-blue/10 text-cetpro-blue">
                    {platform.icon}
                  </div>
                  <div>
                    <CardTitle className="text-2xl">{platform.name}</CardTitle>
                  </div>
                  {platform.requiresAuth && (
                    <div className="ml-auto p-2 rounded-full bg-amber-100 text-amber-600">
                      <Lock className="h-5 w-5" />
                    </div>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base text-gray-600 min-h-[80px]">
                  {platform.description}
                </CardDescription>
              </CardContent>
              <CardFooter>
                <Button 
                  className="w-full bg-cetpro-blue hover:bg-cetpro-darkblue group"
                  onClick={() => platform.requiresAuth ? window.open(googleAuthUrl, "_blank") : window.open(platform.url, "_blank")}
                >
                  Acceder
                  <ExternalLink className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>

        {/* Diálogo de autenticación institucional */}
        <Dialog open={showAuthDialog} onOpenChange={setShowAuthDialog}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold flex items-center gap-2">
                <Mail className="h-5 w-5 text-cetpro-blue" /> 
                Correo Institucional
              </DialogTitle>
            </DialogHeader>
            
            {isError && (
              <Alert className="border-red-300 bg-red-50 text-red-800">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-red-600" />
                  <AlertDescription className="text-red-600">
                    {errorMessage}
                  </AlertDescription>
                </div>
              </Alert>
            )}
            
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-2">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <div className="bg-blue-50 rounded-full overflow-hidden">
                        <Input 
                          placeholder="estudiante@cetpropromaemagdalena.edu.pe" 
                          className="border-0 bg-blue-50 rounded-full h-14 text-md px-6 focus-visible:ring-0 focus-visible:ring-offset-0" 
                          {...field} 
                        />
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2 text-md font-semibold">
                        <KeyRound className="h-4 w-4" /> Contraseña
                      </FormLabel>
                      <FormControl>
                        <div className="border border-gray-300 rounded-full overflow-hidden">
                          <Input 
                            type="password" 
                            placeholder="Ingrese su contraseña" 
                            className="border-0 rounded-full h-14 px-6 focus-visible:ring-0 focus-visible:ring-offset-0" 
                            {...field} 
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <DialogFooter className="pt-6">
                  <Button
                    type="submit"
                    className="w-full bg-cetpro-blue hover:bg-cetpro-darkblue rounded-md h-11 text-md"
                    disabled={isAuthenticating}
                  >
                    {isAuthenticating ? "Redirigiendo..." : "Iniciar Sesión"}
                  </Button>
                </DialogFooter>

                <div className="text-center text-sm text-gray-500 mt-4">
                  <p>
                    Se abrirá la página de autenticación de Google para iniciar sesión 
                    con su cuenta institucional (@cetpropromaemagdalena.edu.pe)
                  </p>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>

        <div className="mt-16 bg-gray-50 p-8 rounded-2xl max-w-3xl mx-auto">
          <h2 className="text-2xl font-semibold text-cetpro-blue mb-4">¿Necesitas ayuda?</h2>
          <p className="text-gray-600 mb-6">
            Si tienes problemas para acceder a las plataformas virtuales o necesitas recuperar tu contraseña, 
            contacta a soporte técnico o a tu profesor responsable.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <Button variant="outline" className="border-cetpro-blue text-cetpro-blue hover:bg-cetpro-blue hover:text-white">
              Manual de Usuario
            </Button>
            <Button variant="outline" className="border-cetpro-blue text-cetpro-blue hover:bg-cetpro-blue hover:text-white">
              Contactar Soporte
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AulaVirtual;
