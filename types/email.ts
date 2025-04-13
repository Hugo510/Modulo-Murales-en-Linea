export interface EmailGroup {
  id: string
  name: string
  description: string
  created_at: string
  created_by: string
  member_count: number
  is_dynamic: boolean
  filter_criteria?: Record<string, any>
}

export interface EmailGroupMember {
  id: string
  group_id: string
  user_id: string
  email: string
  name: string
  added_at: string
}

export interface EmailTemplate {
  id: string
  name: string
  subject: string
  content: string
  created_at: string
  created_by: string
  last_used_at?: string
  usage_count: number
  is_system_template: boolean
}

export interface EmailCampaign {
  id: string
  name: string
  subject: string
  content: string
  created_at: string
  created_by: string
  group_id: string
  template_id?: string
  status: "draft" | "scheduled" | "sending" | "sent" | "failed"
  scheduled_for?: string
  sent_at?: string
  completed_at?: string
  total_recipients: number
  opened_count: number
  clicked_count: number
  failed_count: number
}

export interface EmailRecipient {
  id: string
  campaign_id: string
  user_id: string
  email: string
  status: "pending" | "sent" | "opened" | "clicked" | "bounced" | "failed"
  tracking_id: string
  sent_at?: string
  opened_at?: string
  clicked_at?: string
  clicked_link?: string
  bounce_reason?: string
}

export interface EmailStats {
  sent: number
  opened: number
  clicked: number
  bounced: number
  failed: number
  openRate: number
  clickRate: number
}
