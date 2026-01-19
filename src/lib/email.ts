import { supabase } from '@/integrations/supabase/client';

interface SendAppointmentEmailParams {
  professionalEmail: string;
  professionalName: string;
  clientName: string;
  clientPhone: string;
  serviceName: string;
  appointmentDate: string;
  appointmentTime: string;
  servicePrice: number;
}

export async function sendAppointmentNotification(params: SendAppointmentEmailParams) {
  try {
    const { data, error } = await supabase.functions.invoke('send-appointment-email', {
      body: params,
    });

    if (error) {
      console.error('Erro ao enviar email:', error);
      return { success: false, error };
    }

    console.log('Email enviado com sucesso:', data);
    return { success: true, data };
  } catch (error) {
    console.error('Erro ao enviar email:', error);
    return { success: false, error };
  }
}
