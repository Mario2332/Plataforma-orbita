import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LogIn, UserPlus } from "lucide-react";
import { useLocation } from "wouter";

interface LoginCTAProps {
  title: string;
  description: string;
}

export default function LoginCTA({ title, description }: LoginCTAProps) {
  const [, navigate] = useLocation();

  return (
    <Card className="border-2 border-dashed border-primary/50 bg-primary/5 shadow-lg animate-slide-up">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl text-primary">{title}</CardTitle>
        <CardDescription className="text-lg text-muted-foreground">
          {description}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col sm:flex-row gap-4 justify-center">
        <Button 
          onClick={() => navigate("/login")} 
          className="gap-2 bg-primary hover:bg-primary/90"
          size="lg"
        >
          <LogIn className="h-5 w-5" />
          Fazer Login
        </Button>
        <Button 
          onClick={() => navigate("/cadastro")} 
          variant="outline" 
          className="gap-2 border-primary text-primary hover:bg-primary/10"
          size="lg"
        >
          <UserPlus className="h-5 w-5" />
          Criar Conta Gratuita
        </Button>
      </CardContent>
    </Card>
  );
}
