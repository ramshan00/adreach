import { CheckCircle2 } from "lucide-react";
export function RegistrationSuccess({ message }: { message: string }) { return <div className="success-message" role="status" tabIndex={-1}><CheckCircle2 /> <span>{message}</span></div>; }
