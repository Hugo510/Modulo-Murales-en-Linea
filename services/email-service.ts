import { getSupabaseClient } from "@/lib/supabase/client";
import type { EmailTemplate, EmailGroup, EmailCampaign } from "@/types/email";

// Tipo para las estadísticas de email
type EmailStats = { status: string; count: number };

// Cliente de Supabase (inicializado cuando se necesita)
const getSupabase = async () => {
  return getSupabaseClient();
};

// Función para obtener todos los grupos de correo
export async function getEmailGroups() {
  const supabase = await getSupabase();
  const { data, error } = await supabase
    .from("email_groups")
    .select("*")
    .order("name");

  if (error) {
    console.error("Error al obtener grupos de correo:", error);
    throw new Error("No se pudieron cargar los grupos de correo");
  }

  return data as EmailGroup[];
}

// Función para obtener un grupo específico con sus miembros
export async function getEmailGroupWithMembers(groupId: string) {
  const supabase = await getSupabase();
  const { data, error } = await supabase
    .from("email_groups")
    .select(
      `
      *,
      email_group_members(*)
    `
    )
    .eq("id", groupId)
    .single();

  if (error) {
    console.error("Error al obtener grupo de correo:", error);
    throw new Error("No se pudo cargar el grupo de correo");
  }

  return data as EmailGroup & {
    email_group_members: { user_id: string; email: string; name: string }[];
  };
}

// Función para crear un nuevo grupo de correo
export async function createEmailGroup(
  group: Omit<EmailGroup, "id" | "created_at">
) {
  const supabase = await getSupabase();
  const { data, error } = await supabase
    .from("email_groups")
    .insert([group])
    .select();

  if (error) {
    console.error("Error al crear grupo de correo:", error);
    throw new Error("No se pudo crear el grupo de correo");
  }

  return data[0] as EmailGroup;
}

// Función para añadir miembros a un grupo
export async function addMembersToGroup(
  groupId: string,
  members: { user_id: string; email: string; name: string }[]
) {
  const supabase = await getSupabase();
  const { data, error } = await supabase
    .from("email_group_members")
    .insert(members.map((member) => ({ ...member, group_id: groupId })));

  if (error) {
    console.error("Error al añadir miembros al grupo:", error);
    throw new Error("No se pudieron añadir los miembros al grupo");
  }

  return data;
}

// Función para obtener todas las plantillas de correo
export async function getEmailTemplates() {
  const supabase = await getSupabase();
  const { data, error } = await supabase
    .from("email_templates")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error al obtener plantillas de correo:", error);
    throw new Error("No se pudieron cargar las plantillas de correo");
  }

  return data as EmailTemplate[];
}

// Función para crear una nueva plantilla de correo
export async function createEmailTemplate(
  template: Omit<EmailTemplate, "id" | "created_at">
) {
  const supabase = await getSupabase();
  const { data, error } = await supabase
    .from("email_templates")
    .insert([template])
    .select();

  if (error) {
    console.error("Error al crear plantilla de correo:", error);
    throw new Error("No se pudo crear la plantilla de correo");
  }

  return data[0] as EmailTemplate;
}

// Función para crear una nueva campaña de correo
export async function createEmailCampaign(
  campaign: Omit<EmailCampaign, "id" | "created_at" | "status">
) {
  const supabase = await getSupabase();
  const { data, error } = await supabase
    .from("email_campaigns")
    .insert([{ ...campaign, status: "draft" }])
    .select();

  if (error) {
    console.error("Error al crear campaña de correo:", error);
    throw new Error("No se pudo crear la campaña de correo");
  }

  return data[0] as EmailCampaign;
}

// Función para programar el envío de una campaña
export async function scheduleEmailCampaign(
  campaignId: string,
  scheduledFor: Date
) {
  const supabase = await getSupabase();
  const { data, error } = await supabase
    .from("email_campaigns")
    .update({
      status: "scheduled",
      scheduled_for: scheduledFor.toISOString(),
    })
    .eq("id", campaignId)
    .select();

  if (error) {
    console.error("Error al programar campaña:", error);
    throw new Error("No se pudo programar la campaña");
  }

  return data[0] as EmailCampaign;
}

// Función para enviar una campaña inmediatamente
export async function sendEmailCampaignNow(campaignId: string) {
  const supabase = await getSupabase();
  // Primero actualizamos el estado de la campaña
  const { data: campaign, error: updateError } = await supabase
    .from("email_campaigns")
    .update({
      status: "sending",
      sent_at: new Date().toISOString(),
    })
    .eq("id", campaignId)
    .select()
    .single();

  if (updateError) {
    console.error("Error al actualizar estado de campaña:", updateError);
    throw new Error("No se pudo iniciar el envío de la campaña");
  }

  // Obtenemos los destinatarios
  const { data: recipients, error: recipientsError } = await supabase
    .from("email_group_members")
    .select("*")
    .eq("group_id", campaign.group_id);

  if (recipientsError) {
    console.error("Error al obtener destinatarios:", recipientsError);
    throw new Error("No se pudieron obtener los destinatarios");
  }

  // Aquí iría la lógica para enviar los correos a través de un servicio externo
  // como SendGrid, Mailchimp, etc.
  // Por ahora, simulamos el envío

  // Registramos los destinatarios en la tabla de seguimiento
  const recipientEntries = recipients.map((recipient: any) => ({
    campaign_id: campaignId,
    user_id: recipient.user_id,
    email: recipient.email,
    status: "sent",
    sent_at: new Date().toISOString(),
  }));

  const { error: trackingError } = await supabase
    .from("email_campaign_recipients")
    .insert(recipientEntries);

  if (trackingError) {
    console.error("Error al registrar destinatarios:", trackingError);
    // No lanzamos error aquí para no interrumpir el flujo
  }

  // Actualizamos el estado de la campaña a enviada
  const { data: updatedCampaign, error: completeError } = await supabase
    .from("email_campaigns")
    .update({
      status: "sent",
      completed_at: new Date().toISOString(),
    })
    .eq("id", campaignId)
    .select()
    .single();

  if (completeError) {
    console.error("Error al finalizar campaña:", completeError);
    throw new Error(
      "La campaña se envió pero hubo un error al actualizar su estado"
    );
  }

  return updatedCampaign as EmailCampaign;
}

// Función para obtener estadísticas de una campaña
export async function getCampaignStats(campaignId: string) {
  const supabase = await getSupabase();

  // Reemplazar la consulta que usa .group() con la nueva sintaxis
  const { data, error } = await supabase
    .from("email_campaign_recipients")
    .select("status, count", { count: "exact" })
    .eq("campaign_id", campaignId)
    .order("status");

  if (error) {
    console.error("Error al obtener estadísticas:", error);
    throw new Error("No se pudieron cargar las estadísticas de la campaña");
  }

  // Transformar los datos para tener el formato esperado
  const stats: EmailStats[] = [];
  const countByStatus = new Map<string, number>();

  for (const row of data) {
    if (!countByStatus.has(row.status)) {
      countByStatus.set(row.status, 0);
    }
    countByStatus.set(row.status, countByStatus.get(row.status)! + 1);
  }

  countByStatus.forEach((count, status) => {
    stats.push({ status, count });
  });

  return stats;
}

// Función para obtener todas las campañas
export async function getEmailCampaigns() {
  const supabase = await getSupabase();
  const { data, error } = await supabase
    .from("email_campaigns")
    .select(
      `
      *,
      email_groups(name)
    `
    )
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error al obtener campañas:", error);
    throw new Error("No se pudieron cargar las campañas");
  }

  return data as (EmailCampaign & { email_groups: { name: string } })[];
}

// Función para obtener una campaña específica con sus estadísticas
export async function getEmailCampaignWithStats(campaignId: string) {
  const supabase = await getSupabase();
  const { data: campaign, error: campaignError } = await supabase
    .from("email_campaigns")
    .select(
      `
      *,
      email_groups(name)
    `
    )
    .eq("id", campaignId)
    .single();

  if (campaignError) {
    console.error("Error al obtener campaña:", campaignError);
    throw new Error("No se pudo cargar la campaña");
  }

  // Reemplazar la consulta que usa .group() con la nueva sintaxis
  const { data, error: statsError } = await supabase
    .from("email_campaign_recipients")
    .select("status")
    .eq("campaign_id", campaignId);

  if (statsError) {
    console.error("Error al obtener estadísticas:", statsError);
    // No lanzamos error aquí para no interrumpir el flujo
  }

  // Procesar los datos para obtener los conteos
  const stats: EmailStats[] = [];
  if (data) {
    const countByStatus = new Map<string, number>();

    for (const row of data) {
      if (!countByStatus.has(row.status)) {
        countByStatus.set(row.status, 0);
      }
      countByStatus.set(row.status, countByStatus.get(row.status)! + 1);
    }

    countByStatus.forEach((count, status) => {
      stats.push({ status, count });
    });
  }

  return {
    campaign: campaign as EmailCampaign & { email_groups: { name: string } },
    stats,
  };
}

// Función para registrar eventos de apertura y clic
export async function trackEmailEvent(
  type: "open" | "click",
  trackingId: string,
  linkId?: string
) {
  const supabase = await getSupabase();
  const { data: recipient, error: findError } = await supabase
    .from("email_campaign_recipients")
    .select("*")
    .eq("tracking_id", trackingId)
    .single();

  if (findError) {
    console.error("Error al encontrar destinatario:", findError);
    return;
  }

  const updateData =
    type === "open"
      ? {
          opened_at: new Date().toISOString(),
          status: "opened",
        }
      : {
          clicked_at: new Date().toISOString(),
          status: "clicked",
          clicked_link: linkId,
        };

  const { error: updateError } = await supabase
    .from("email_campaign_recipients")
    .update(updateData)
    .eq("id", recipient.id);

  if (updateError) {
    console.error(`Error al registrar evento de ${type}:`, updateError);
  }

  return true;
}
