export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      actuator_logs: {
        Row: {
          action_hash: string
          action_payload: Json
          action_type: string
          error_message: string | null
          executed_at: string | null
          execution_time_ms: number | null
          id: string
          organization_id: string
          reasoning_summary: string | null
          result: Json | null
          rule_id: string | null
          status: string
          trigger_id: string | null
          trigger_source: string
        }
        Insert: {
          action_hash: string
          action_payload: Json
          action_type: string
          error_message?: string | null
          executed_at?: string | null
          execution_time_ms?: number | null
          id?: string
          organization_id: string
          reasoning_summary?: string | null
          result?: Json | null
          rule_id?: string | null
          status: string
          trigger_id?: string | null
          trigger_source: string
        }
        Update: {
          action_hash?: string
          action_payload?: Json
          action_type?: string
          error_message?: string | null
          executed_at?: string | null
          execution_time_ms?: number | null
          id?: string
          organization_id?: string
          reasoning_summary?: string | null
          result?: Json | null
          rule_id?: string | null
          status?: string
          trigger_id?: string | null
          trigger_source?: string
        }
        Relationships: [
          {
            foreignKeyName: "actuator_logs_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "engagement_metrics"
            referencedColumns: ["organization_id"]
          },
          {
            foreignKeyName: "actuator_logs_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "actuator_logs_rule_id_fkey"
            columns: ["rule_id"]
            isOneToOne: false
            referencedRelation: "actuator_rules"
            referencedColumns: ["id"]
          },
        ]
      }
      actuator_rules: {
        Row: {
          action_config: Json
          action_type: string
          ai_managed: boolean | null
          condition_logic: Json
          created_at: string | null
          created_by: string | null
          description: string | null
          enabled: boolean | null
          execution_count: number | null
          id: string
          last_executed_at: string | null
          name: string
          organization_id: string
          priority: number | null
          trigger_config: Json
          trigger_type: string
          updated_at: string | null
        }
        Insert: {
          action_config: Json
          action_type: string
          ai_managed?: boolean | null
          condition_logic: Json
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          enabled?: boolean | null
          execution_count?: number | null
          id?: string
          last_executed_at?: string | null
          name: string
          organization_id: string
          priority?: number | null
          trigger_config?: Json
          trigger_type: string
          updated_at?: string | null
        }
        Update: {
          action_config?: Json
          action_type?: string
          ai_managed?: boolean | null
          condition_logic?: Json
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          enabled?: boolean | null
          execution_count?: number | null
          id?: string
          last_executed_at?: string | null
          name?: string
          organization_id?: string
          priority?: number | null
          trigger_config?: Json
          trigger_type?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "actuator_rules_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "engagement_metrics"
            referencedColumns: ["organization_id"]
          },
          {
            foreignKeyName: "actuator_rules_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      actuator_triggers: {
        Row: {
          created_at: string | null
          data_source_id: string | null
          data_source_type: string
          enabled: boolean | null
          filter_config: Json | null
          id: string
          organization_id: string
          rule_id: string
        }
        Insert: {
          created_at?: string | null
          data_source_id?: string | null
          data_source_type: string
          enabled?: boolean | null
          filter_config?: Json | null
          id?: string
          organization_id: string
          rule_id: string
        }
        Update: {
          created_at?: string | null
          data_source_id?: string | null
          data_source_type?: string
          enabled?: boolean | null
          filter_config?: Json | null
          id?: string
          organization_id?: string
          rule_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "actuator_triggers_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "engagement_metrics"
            referencedColumns: ["organization_id"]
          },
          {
            foreignKeyName: "actuator_triggers_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "actuator_triggers_rule_id_fkey"
            columns: ["rule_id"]
            isOneToOne: false
            referencedRelation: "actuator_rules"
            referencedColumns: ["id"]
          },
        ]
      }
      agent_queue: {
        Row: {
          completed_at: string | null
          created_at: string | null
          error_message: string | null
          id: string
          max_retries: number | null
          organization_id: string
          payload: Json
          priority: number | null
          result: Json | null
          retry_count: number | null
          scheduled_for: string | null
          started_at: string | null
          status: Database["public"]["Enums"]["agent_task_status"]
          task_type: Database["public"]["Enums"]["agent_task_type"]
          updated_at: string | null
        }
        Insert: {
          completed_at?: string | null
          created_at?: string | null
          error_message?: string | null
          id?: string
          max_retries?: number | null
          organization_id: string
          payload: Json
          priority?: number | null
          result?: Json | null
          retry_count?: number | null
          scheduled_for?: string | null
          started_at?: string | null
          status?: Database["public"]["Enums"]["agent_task_status"]
          task_type: Database["public"]["Enums"]["agent_task_type"]
          updated_at?: string | null
        }
        Update: {
          completed_at?: string | null
          created_at?: string | null
          error_message?: string | null
          id?: string
          max_retries?: number | null
          organization_id?: string
          payload?: Json
          priority?: number | null
          result?: Json | null
          retry_count?: number | null
          scheduled_for?: string | null
          started_at?: string | null
          status?: Database["public"]["Enums"]["agent_task_status"]
          task_type?: Database["public"]["Enums"]["agent_task_type"]
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "agent_queue_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "engagement_metrics"
            referencedColumns: ["organization_id"]
          },
          {
            foreignKeyName: "agent_queue_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      agent_task_history: {
        Row: {
          created_at: string | null
          error_message: string | null
          execution_time_ms: number | null
          id: string
          organization_id: string
          payload: Json
          result: Json | null
          status: Database["public"]["Enums"]["agent_task_status"]
          task_id: string
          task_type: Database["public"]["Enums"]["agent_task_type"]
        }
        Insert: {
          created_at?: string | null
          error_message?: string | null
          execution_time_ms?: number | null
          id?: string
          organization_id: string
          payload: Json
          result?: Json | null
          status: Database["public"]["Enums"]["agent_task_status"]
          task_id: string
          task_type: Database["public"]["Enums"]["agent_task_type"]
        }
        Update: {
          created_at?: string | null
          error_message?: string | null
          execution_time_ms?: number | null
          id?: string
          organization_id?: string
          payload?: Json
          result?: Json | null
          status?: Database["public"]["Enums"]["agent_task_status"]
          task_id?: string
          task_type?: Database["public"]["Enums"]["agent_task_type"]
        }
        Relationships: [
          {
            foreignKeyName: "agent_task_history_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "engagement_metrics"
            referencedColumns: ["organization_id"]
          },
          {
            foreignKeyName: "agent_task_history_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "agent_task_history_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "agent_queue"
            referencedColumns: ["id"]
          },
        ]
      }
      ai_act_assessments: {
        Row: {
          ai_system_id: string | null
          annex_iv_compliant: boolean | null
          annex_iv_summary: string | null
          assessment_date: string | null
          assessor_id: string | null
          created_at: string | null
          findings: Json | null
          id: string
          recommendations: string[] | null
          report_url: string | null
          risk_category: string
          status: string | null
        }
        Insert: {
          ai_system_id?: string | null
          annex_iv_compliant?: boolean | null
          annex_iv_summary?: string | null
          assessment_date?: string | null
          assessor_id?: string | null
          created_at?: string | null
          findings?: Json | null
          id?: string
          recommendations?: string[] | null
          report_url?: string | null
          risk_category: string
          status?: string | null
        }
        Update: {
          ai_system_id?: string | null
          annex_iv_compliant?: boolean | null
          annex_iv_summary?: string | null
          assessment_date?: string | null
          assessor_id?: string | null
          created_at?: string | null
          findings?: Json | null
          id?: string
          recommendations?: string[] | null
          report_url?: string | null
          risk_category?: string
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ai_act_assessments_ai_system_id_fkey"
            columns: ["ai_system_id"]
            isOneToOne: false
            referencedRelation: "ai_systems"
            referencedColumns: ["id"]
          },
        ]
      }
      ai_act_checks: {
        Row: {
          assessment_id: string | null
          checked_at: string | null
          evidence: string | null
          evidence_urls: string[] | null
          id: string
          notes: string | null
          requirement_code: string
          requirement_text: string | null
          status: string
        }
        Insert: {
          assessment_id?: string | null
          checked_at?: string | null
          evidence?: string | null
          evidence_urls?: string[] | null
          id?: string
          notes?: string | null
          requirement_code: string
          requirement_text?: string | null
          status: string
        }
        Update: {
          assessment_id?: string | null
          checked_at?: string | null
          evidence?: string | null
          evidence_urls?: string[] | null
          id?: string
          notes?: string | null
          requirement_code?: string
          requirement_text?: string | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "ai_act_checks_assessment_id_fkey"
            columns: ["assessment_id"]
            isOneToOne: false
            referencedRelation: "ai_act_assessments"
            referencedColumns: ["id"]
          },
        ]
      }
      ai_actuator_feedback: {
        Row: {
          ai_suggestions: Json | null
          avg_time_to_resolution: number | null
          created_at: string | null
          evaluated_period_end: string | null
          evaluated_period_start: string | null
          id: string
          manual_overrides: number | null
          organization_id: string
          rule_id: string
          success_rate: number | null
        }
        Insert: {
          ai_suggestions?: Json | null
          avg_time_to_resolution?: number | null
          created_at?: string | null
          evaluated_period_end?: string | null
          evaluated_period_start?: string | null
          id?: string
          manual_overrides?: number | null
          organization_id: string
          rule_id: string
          success_rate?: number | null
        }
        Update: {
          ai_suggestions?: Json | null
          avg_time_to_resolution?: number | null
          created_at?: string | null
          evaluated_period_end?: string | null
          evaluated_period_start?: string | null
          id?: string
          manual_overrides?: number | null
          organization_id?: string
          rule_id?: string
          success_rate?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "ai_actuator_feedback_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "engagement_metrics"
            referencedColumns: ["organization_id"]
          },
          {
            foreignKeyName: "ai_actuator_feedback_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ai_actuator_feedback_rule_id_fkey"
            columns: ["rule_id"]
            isOneToOne: false
            referencedRelation: "actuator_rules"
            referencedColumns: ["id"]
          },
        ]
      }
      ai_conformity_reports: {
        Row: {
          ai_system_id: string | null
          annex_iv_items: Json
          compliance_status: string
          created_at: string | null
          evidence_summary: Json | null
          expires_at: string | null
          generated_at: string | null
          generated_by: string | null
          id: string
          metadata: Json | null
          organization_id: string
          pdf_url: string | null
          previous_version_id: string | null
          report_type: string
          risk_category: string
          signature_algorithm: string | null
          signed_hash: string | null
          updated_at: string | null
          version: number | null
        }
        Insert: {
          ai_system_id?: string | null
          annex_iv_items?: Json
          compliance_status?: string
          created_at?: string | null
          evidence_summary?: Json | null
          expires_at?: string | null
          generated_at?: string | null
          generated_by?: string | null
          id?: string
          metadata?: Json | null
          organization_id: string
          pdf_url?: string | null
          previous_version_id?: string | null
          report_type?: string
          risk_category: string
          signature_algorithm?: string | null
          signed_hash?: string | null
          updated_at?: string | null
          version?: number | null
        }
        Update: {
          ai_system_id?: string | null
          annex_iv_items?: Json
          compliance_status?: string
          created_at?: string | null
          evidence_summary?: Json | null
          expires_at?: string | null
          generated_at?: string | null
          generated_by?: string | null
          id?: string
          metadata?: Json | null
          organization_id?: string
          pdf_url?: string | null
          previous_version_id?: string | null
          report_type?: string
          risk_category?: string
          signature_algorithm?: string | null
          signed_hash?: string | null
          updated_at?: string | null
          version?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "ai_conformity_reports_ai_system_id_fkey"
            columns: ["ai_system_id"]
            isOneToOne: false
            referencedRelation: "ai_systems"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ai_conformity_reports_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "engagement_metrics"
            referencedColumns: ["organization_id"]
          },
          {
            foreignKeyName: "ai_conformity_reports_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ai_conformity_reports_previous_version_id_fkey"
            columns: ["previous_version_id"]
            isOneToOne: false
            referencedRelation: "ai_conformity_reports"
            referencedColumns: ["id"]
          },
        ]
      }
      ai_feedback_detailed: {
        Row: {
          comment: string | null
          context: Json | null
          created_at: string | null
          feedback_score: number | null
          feedback_type: string
          id: string
          interaction_id: string | null
          model_version: string | null
          module_name: string
          organization_id: string
          prompt_hash: string | null
          response_hash: string | null
          user_id: string | null
        }
        Insert: {
          comment?: string | null
          context?: Json | null
          created_at?: string | null
          feedback_score?: number | null
          feedback_type: string
          id?: string
          interaction_id?: string | null
          model_version?: string | null
          module_name: string
          organization_id: string
          prompt_hash?: string | null
          response_hash?: string | null
          user_id?: string | null
        }
        Update: {
          comment?: string | null
          context?: Json | null
          created_at?: string | null
          feedback_score?: number | null
          feedback_type?: string
          id?: string
          interaction_id?: string | null
          model_version?: string | null
          module_name?: string
          organization_id?: string
          prompt_hash?: string | null
          response_hash?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ai_feedback_detailed_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "engagement_metrics"
            referencedColumns: ["organization_id"]
          },
          {
            foreignKeyName: "ai_feedback_detailed_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      ai_models: {
        Row: {
          compliance_status: string | null
          created_at: string | null
          dataset_ref: string | null
          id: string
          model_type: string | null
          name: string
          organization_id: string
          provider: string | null
          registered_by: string | null
          risk_tag: string | null
          updated_at: string | null
          version: string | null
        }
        Insert: {
          compliance_status?: string | null
          created_at?: string | null
          dataset_ref?: string | null
          id?: string
          model_type?: string | null
          name: string
          organization_id: string
          provider?: string | null
          registered_by?: string | null
          risk_tag?: string | null
          updated_at?: string | null
          version?: string | null
        }
        Update: {
          compliance_status?: string | null
          created_at?: string | null
          dataset_ref?: string | null
          id?: string
          model_type?: string | null
          name?: string
          organization_id?: string
          provider?: string | null
          registered_by?: string | null
          risk_tag?: string | null
          updated_at?: string | null
          version?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ai_models_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "engagement_metrics"
            referencedColumns: ["organization_id"]
          },
          {
            foreignKeyName: "ai_models_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      ai_systems: {
        Row: {
          created_at: string | null
          deployment_status: string | null
          id: string
          metadata: Json | null
          model_type: string | null
          name: string
          organization_id: string
          purpose: string | null
          risk_category: string | null
          risk_score: number | null
          sector: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          deployment_status?: string | null
          id?: string
          metadata?: Json | null
          model_type?: string | null
          name: string
          organization_id: string
          purpose?: string | null
          risk_category?: string | null
          risk_score?: number | null
          sector?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          deployment_status?: string | null
          id?: string
          metadata?: Json | null
          model_type?: string | null
          name?: string
          organization_id?: string
          purpose?: string | null
          risk_category?: string | null
          risk_score?: number | null
          sector?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ai_systems_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "engagement_metrics"
            referencedColumns: ["organization_id"]
          },
          {
            foreignKeyName: "ai_systems_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      alert_notifications: {
        Row: {
          acknowledged: boolean | null
          acknowledged_at: string | null
          acknowledged_by: string | null
          id: string
          metric_type: string
          metric_value: number
          notes: string | null
          organization_id: string
          period_label: string
          threshold_id: string
          threshold_value: number
          time_period: string
          triggered_at: string | null
        }
        Insert: {
          acknowledged?: boolean | null
          acknowledged_at?: string | null
          acknowledged_by?: string | null
          id?: string
          metric_type: string
          metric_value: number
          notes?: string | null
          organization_id: string
          period_label: string
          threshold_id: string
          threshold_value: number
          time_period: string
          triggered_at?: string | null
        }
        Update: {
          acknowledged?: boolean | null
          acknowledged_at?: string | null
          acknowledged_by?: string | null
          id?: string
          metric_type?: string
          metric_value?: number
          notes?: string | null
          organization_id?: string
          period_label?: string
          threshold_id?: string
          threshold_value?: number
          time_period?: string
          triggered_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "alert_notifications_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "engagement_metrics"
            referencedColumns: ["organization_id"]
          },
          {
            foreignKeyName: "alert_notifications_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "alert_notifications_threshold_id_fkey"
            columns: ["threshold_id"]
            isOneToOne: false
            referencedRelation: "alert_thresholds"
            referencedColumns: ["id"]
          },
        ]
      }
      alert_policies: {
        Row: {
          comparison_operator: string
          contact_email: string | null
          cooldown_minutes: number | null
          created_at: string | null
          enabled: boolean | null
          id: string
          last_triggered_at: string | null
          metric_type: string
          notification_channels: string[] | null
          organization_id: string | null
          policy_name: string
          severity: string
          threshold_value: number
          updated_at: string | null
          webhook_url: string | null
        }
        Insert: {
          comparison_operator: string
          contact_email?: string | null
          cooldown_minutes?: number | null
          created_at?: string | null
          enabled?: boolean | null
          id?: string
          last_triggered_at?: string | null
          metric_type: string
          notification_channels?: string[] | null
          organization_id?: string | null
          policy_name: string
          severity: string
          threshold_value: number
          updated_at?: string | null
          webhook_url?: string | null
        }
        Update: {
          comparison_operator?: string
          contact_email?: string | null
          cooldown_minutes?: number | null
          created_at?: string | null
          enabled?: boolean | null
          id?: string
          last_triggered_at?: string | null
          metric_type?: string
          notification_channels?: string[] | null
          organization_id?: string | null
          policy_name?: string
          severity?: string
          threshold_value?: number
          updated_at?: string | null
          webhook_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "alert_policies_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "engagement_metrics"
            referencedColumns: ["organization_id"]
          },
          {
            foreignKeyName: "alert_policies_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      alert_thresholds: {
        Row: {
          created_at: string | null
          id: string
          metric_type: string
          notification_enabled: boolean | null
          organization_id: string
          threshold_value: number
          time_period: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          metric_type: string
          notification_enabled?: boolean | null
          organization_id: string
          threshold_value: number
          time_period?: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          metric_type?: string
          notification_enabled?: boolean | null
          organization_id?: string
          threshold_value?: number
          time_period?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "alert_thresholds_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "engagement_metrics"
            referencedColumns: ["organization_id"]
          },
          {
            foreignKeyName: "alert_thresholds_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      annex_iv_documents: {
        Row: {
          ai_system_id: string | null
          conformity_report_id: string
          created_at: string | null
          development_process: Json
          document_version: string
          general_description: Json
          generated_at: string | null
          hash_signature: string | null
          id: string
          monitoring_logging: Json
          organization_id: string
          pdf_export_url: string | null
          risk_management: Json
          technical_documentation: Json
          transparency_info: Json
          updated_at: string | null
          updates_maintenance: Json
        }
        Insert: {
          ai_system_id?: string | null
          conformity_report_id: string
          created_at?: string | null
          development_process?: Json
          document_version?: string
          general_description?: Json
          generated_at?: string | null
          hash_signature?: string | null
          id?: string
          monitoring_logging?: Json
          organization_id: string
          pdf_export_url?: string | null
          risk_management?: Json
          technical_documentation?: Json
          transparency_info?: Json
          updated_at?: string | null
          updates_maintenance?: Json
        }
        Update: {
          ai_system_id?: string | null
          conformity_report_id?: string
          created_at?: string | null
          development_process?: Json
          document_version?: string
          general_description?: Json
          generated_at?: string | null
          hash_signature?: string | null
          id?: string
          monitoring_logging?: Json
          organization_id?: string
          pdf_export_url?: string | null
          risk_management?: Json
          technical_documentation?: Json
          transparency_info?: Json
          updated_at?: string | null
          updates_maintenance?: Json
        }
        Relationships: [
          {
            foreignKeyName: "annex_iv_documents_ai_system_id_fkey"
            columns: ["ai_system_id"]
            isOneToOne: false
            referencedRelation: "ai_systems"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "annex_iv_documents_conformity_report_id_fkey"
            columns: ["conformity_report_id"]
            isOneToOne: false
            referencedRelation: "ai_conformity_reports"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "annex_iv_documents_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "engagement_metrics"
            referencedColumns: ["organization_id"]
          },
          {
            foreignKeyName: "annex_iv_documents_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      api_keys: {
        Row: {
          created_at: string | null
          created_by: string | null
          environment: string
          expires_at: string | null
          id: string
          is_active: boolean | null
          key_hash: string
          key_name: string
          key_prefix: string
          last_used_at: string | null
          partner_account_id: string
          scopes: string[]
          usage_count: number | null
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          environment?: string
          expires_at?: string | null
          id?: string
          is_active?: boolean | null
          key_hash: string
          key_name: string
          key_prefix: string
          last_used_at?: string | null
          partner_account_id: string
          scopes?: string[]
          usage_count?: number | null
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          environment?: string
          expires_at?: string | null
          id?: string
          is_active?: boolean | null
          key_hash?: string
          key_name?: string
          key_prefix?: string
          last_used_at?: string | null
          partner_account_id?: string
          scopes?: string[]
          usage_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "api_keys_partner_account_id_fkey"
            columns: ["partner_account_id"]
            isOneToOne: false
            referencedRelation: "partner_accounts"
            referencedColumns: ["id"]
          },
        ]
      }
      api_usage_logs: {
        Row: {
          api_key_id: string | null
          endpoint: string
          error_message: string | null
          id: string
          ip_address: unknown
          metadata: Json | null
          method: string
          partner_account_id: string
          request_size_bytes: number | null
          response_size_bytes: number | null
          response_time_ms: number | null
          status_code: number
          timestamp: string | null
          user_agent: string | null
        }
        Insert: {
          api_key_id?: string | null
          endpoint: string
          error_message?: string | null
          id?: string
          ip_address?: unknown
          metadata?: Json | null
          method: string
          partner_account_id: string
          request_size_bytes?: number | null
          response_size_bytes?: number | null
          response_time_ms?: number | null
          status_code: number
          timestamp?: string | null
          user_agent?: string | null
        }
        Update: {
          api_key_id?: string | null
          endpoint?: string
          error_message?: string | null
          id?: string
          ip_address?: unknown
          metadata?: Json | null
          method?: string
          partner_account_id?: string
          request_size_bytes?: number | null
          response_size_bytes?: number | null
          response_time_ms?: number | null
          status_code?: number
          timestamp?: string | null
          user_agent?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "api_usage_logs_api_key_id_fkey"
            columns: ["api_key_id"]
            isOneToOne: false
            referencedRelation: "api_keys"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "api_usage_logs_partner_account_id_fkey"
            columns: ["partner_account_id"]
            isOneToOne: false
            referencedRelation: "partner_accounts"
            referencedColumns: ["id"]
          },
        ]
      }
      assessment_tasks: {
        Row: {
          assessment_id: string
          assessment_type: string
          assigned_to: string | null
          created_at: string | null
          description: string | null
          due_date: string | null
          id: string
          priority: string | null
          status: string | null
          title: string
          updated_at: string | null
        }
        Insert: {
          assessment_id: string
          assessment_type: string
          assigned_to?: string | null
          created_at?: string | null
          description?: string | null
          due_date?: string | null
          id?: string
          priority?: string | null
          status?: string | null
          title: string
          updated_at?: string | null
        }
        Update: {
          assessment_id?: string
          assessment_type?: string
          assigned_to?: string | null
          created_at?: string | null
          description?: string | null
          due_date?: string | null
          id?: string
          priority?: string | null
          status?: string | null
          title?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      audit_evidence: {
        Row: {
          control_id: string | null
          description: string | null
          evidence_type: string
          file_url: string | null
          id: string
          metadata: Json | null
          organization_id: string
          title: string
          uploaded_at: string | null
          uploaded_by: string | null
          verified_at: string | null
          verified_by: string | null
        }
        Insert: {
          control_id?: string | null
          description?: string | null
          evidence_type: string
          file_url?: string | null
          id?: string
          metadata?: Json | null
          organization_id: string
          title: string
          uploaded_at?: string | null
          uploaded_by?: string | null
          verified_at?: string | null
          verified_by?: string | null
        }
        Update: {
          control_id?: string | null
          description?: string | null
          evidence_type?: string
          file_url?: string | null
          id?: string
          metadata?: Json | null
          organization_id?: string
          title?: string
          uploaded_at?: string | null
          uploaded_by?: string | null
          verified_at?: string | null
          verified_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "audit_evidence_control_id_fkey"
            columns: ["control_id"]
            isOneToOne: false
            referencedRelation: "compliance_controls"
            referencedColumns: ["id"]
          },
        ]
      }
      audit_logs: {
        Row: {
          action: string
          actor_id: string | null
          agent: string
          event_category: string | null
          event_type: string
          id: string
          input_hash: string
          organization_id: string
          output_hash: string | null
          prev_hash: string | null
          reasoning_chain: Json | null
          request_payload: Json | null
          response_summary: Json | null
          status: string
          timestamp: string | null
        }
        Insert: {
          action: string
          actor_id?: string | null
          agent: string
          event_category?: string | null
          event_type: string
          id?: string
          input_hash: string
          organization_id: string
          output_hash?: string | null
          prev_hash?: string | null
          reasoning_chain?: Json | null
          request_payload?: Json | null
          response_summary?: Json | null
          status: string
          timestamp?: string | null
        }
        Update: {
          action?: string
          actor_id?: string | null
          agent?: string
          event_category?: string | null
          event_type?: string
          id?: string
          input_hash?: string
          organization_id?: string
          output_hash?: string | null
          prev_hash?: string | null
          reasoning_chain?: Json | null
          request_payload?: Json | null
          response_summary?: Json | null
          status?: string
          timestamp?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "audit_logs_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "engagement_metrics"
            referencedColumns: ["organization_id"]
          },
          {
            foreignKeyName: "audit_logs_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      auditor_signoffs: {
        Row: {
          auditor_id: string
          certification_body: string | null
          certification_id: string | null
          compliance_score: number | null
          created_at: string | null
          decision: string
          evidence_coverage_score: number | null
          expiry_date: string | null
          id: string
          metadata: Json | null
          organization_id: string
          report_id: string
          review_notes: string | null
          signature_timestamp: string | null
          signed_hash: string
        }
        Insert: {
          auditor_id: string
          certification_body?: string | null
          certification_id?: string | null
          compliance_score?: number | null
          created_at?: string | null
          decision: string
          evidence_coverage_score?: number | null
          expiry_date?: string | null
          id?: string
          metadata?: Json | null
          organization_id: string
          report_id: string
          review_notes?: string | null
          signature_timestamp?: string | null
          signed_hash: string
        }
        Update: {
          auditor_id?: string
          certification_body?: string | null
          certification_id?: string | null
          compliance_score?: number | null
          created_at?: string | null
          decision?: string
          evidence_coverage_score?: number | null
          expiry_date?: string | null
          id?: string
          metadata?: Json | null
          organization_id?: string
          report_id?: string
          review_notes?: string | null
          signature_timestamp?: string | null
          signed_hash?: string
        }
        Relationships: [
          {
            foreignKeyName: "auditor_signoffs_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "engagement_metrics"
            referencedColumns: ["organization_id"]
          },
          {
            foreignKeyName: "auditor_signoffs_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "auditor_signoffs_report_id_fkey"
            columns: ["report_id"]
            isOneToOne: false
            referencedRelation: "ai_conformity_reports"
            referencedColumns: ["id"]
          },
        ]
      }
      auth_audit_logs: {
        Row: {
          created_at: string | null
          event_type: string
          id: string
          ip_address: unknown
          metadata: Json | null
          success: boolean | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          event_type: string
          id?: string
          ip_address?: unknown
          metadata?: Json | null
          success?: boolean | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          event_type?: string
          id?: string
          ip_address?: unknown
          metadata?: Json | null
          success?: boolean | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      billing_history: {
        Row: {
          amount: number
          created_at: string | null
          currency: string
          description: string | null
          id: string
          invoice_pdf: string | null
          organization_id: string
          status: string
          stripe_invoice_id: string | null
          stripe_payment_intent_id: string | null
        }
        Insert: {
          amount: number
          created_at?: string | null
          currency?: string
          description?: string | null
          id?: string
          invoice_pdf?: string | null
          organization_id: string
          status: string
          stripe_invoice_id?: string | null
          stripe_payment_intent_id?: string | null
        }
        Update: {
          amount?: number
          created_at?: string | null
          currency?: string
          description?: string | null
          id?: string
          invoice_pdf?: string | null
          organization_id?: string
          status?: string
          stripe_invoice_id?: string | null
          stripe_payment_intent_id?: string | null
        }
        Relationships: []
      }
      chunk_feedback: {
        Row: {
          chunk_id: string | null
          created_at: string | null
          id: string
          notes: string | null
          organization_id: string | null
          signal: string
          user_id: string | null
          weight: number | null
        }
        Insert: {
          chunk_id?: string | null
          created_at?: string | null
          id?: string
          notes?: string | null
          organization_id?: string | null
          signal: string
          user_id?: string | null
          weight?: number | null
        }
        Update: {
          chunk_id?: string | null
          created_at?: string | null
          id?: string
          notes?: string | null
          organization_id?: string | null
          signal?: string
          user_id?: string | null
          weight?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "chunk_feedback_chunk_id_fkey"
            columns: ["chunk_id"]
            isOneToOne: false
            referencedRelation: "document_chunks"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "chunk_feedback_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "engagement_metrics"
            referencedColumns: ["organization_id"]
          },
          {
            foreignKeyName: "chunk_feedback_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "chunk_feedback_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      compliance_controls: {
        Row: {
          category: string | null
          control_id: string
          created_at: string | null
          description: string | null
          evidence_url: string | null
          framework: string
          id: string
          implementation_notes: string | null
          last_reviewed_at: string | null
          organization_id: string
          owner: string | null
          priority: string | null
          required_for: string[] | null
          status: string
          title: string
          updated_at: string | null
        }
        Insert: {
          category?: string | null
          control_id: string
          created_at?: string | null
          description?: string | null
          evidence_url?: string | null
          framework: string
          id?: string
          implementation_notes?: string | null
          last_reviewed_at?: string | null
          organization_id: string
          owner?: string | null
          priority?: string | null
          required_for?: string[] | null
          status?: string
          title: string
          updated_at?: string | null
        }
        Update: {
          category?: string | null
          control_id?: string
          created_at?: string | null
          description?: string | null
          evidence_url?: string | null
          framework?: string
          id?: string
          implementation_notes?: string | null
          last_reviewed_at?: string | null
          organization_id?: string
          owner?: string | null
          priority?: string | null
          required_for?: string[] | null
          status?: string
          title?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      compliance_data_exchanges: {
        Row: {
          data_type: string
          exchange_type: string
          exchanged_at: string | null
          file_size_bytes: number | null
          file_url: string | null
          format: string
          id: string
          metadata: Json | null
          oauth_token_used: string | null
          organization_id: string
          partner_account_id: string
          record_count: number | null
          signature_hash: string | null
          verification_status: string | null
        }
        Insert: {
          data_type: string
          exchange_type: string
          exchanged_at?: string | null
          file_size_bytes?: number | null
          file_url?: string | null
          format: string
          id?: string
          metadata?: Json | null
          oauth_token_used?: string | null
          organization_id: string
          partner_account_id: string
          record_count?: number | null
          signature_hash?: string | null
          verification_status?: string | null
        }
        Update: {
          data_type?: string
          exchange_type?: string
          exchanged_at?: string | null
          file_size_bytes?: number | null
          file_url?: string | null
          format?: string
          id?: string
          metadata?: Json | null
          oauth_token_used?: string | null
          organization_id?: string
          partner_account_id?: string
          record_count?: number | null
          signature_hash?: string | null
          verification_status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "compliance_data_exchanges_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "engagement_metrics"
            referencedColumns: ["organization_id"]
          },
          {
            foreignKeyName: "compliance_data_exchanges_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "compliance_data_exchanges_partner_account_id_fkey"
            columns: ["partner_account_id"]
            isOneToOne: false
            referencedRelation: "partner_accounts"
            referencedColumns: ["id"]
          },
        ]
      }
      compliance_evidence_links: {
        Row: {
          audit_log_id: string | null
          created_at: string | null
          document_url: string | null
          evidence_category: string | null
          evidence_type: string
          id: string
          metadata: Json | null
          report_id: string
          requirement_code: string | null
          verification_notes: string | null
          verified: boolean | null
          verified_at: string | null
          verified_by: string | null
        }
        Insert: {
          audit_log_id?: string | null
          created_at?: string | null
          document_url?: string | null
          evidence_category?: string | null
          evidence_type: string
          id?: string
          metadata?: Json | null
          report_id: string
          requirement_code?: string | null
          verification_notes?: string | null
          verified?: boolean | null
          verified_at?: string | null
          verified_by?: string | null
        }
        Update: {
          audit_log_id?: string | null
          created_at?: string | null
          document_url?: string | null
          evidence_category?: string | null
          evidence_type?: string
          id?: string
          metadata?: Json | null
          report_id?: string
          requirement_code?: string | null
          verification_notes?: string | null
          verified?: boolean | null
          verified_at?: string | null
          verified_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "compliance_evidence_links_audit_log_id_fkey"
            columns: ["audit_log_id"]
            isOneToOne: false
            referencedRelation: "audit_logs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "compliance_evidence_links_report_id_fkey"
            columns: ["report_id"]
            isOneToOne: false
            referencedRelation: "ai_conformity_reports"
            referencedColumns: ["id"]
          },
        ]
      }
      compliance_reports: {
        Row: {
          created_at: string | null
          error_message: string | null
          generated_at: string | null
          generated_by: string | null
          id: string
          organization_id: string
          pdf_url: string | null
          report_data: Json
          report_period_end: string
          report_period_start: string
          report_type: string
          status: string | null
        }
        Insert: {
          created_at?: string | null
          error_message?: string | null
          generated_at?: string | null
          generated_by?: string | null
          id?: string
          organization_id: string
          pdf_url?: string | null
          report_data: Json
          report_period_end: string
          report_period_start: string
          report_type: string
          status?: string | null
        }
        Update: {
          created_at?: string | null
          error_message?: string | null
          generated_at?: string | null
          generated_by?: string | null
          id?: string
          organization_id?: string
          pdf_url?: string | null
          report_data?: Json
          report_period_end?: string
          report_period_start?: string
          report_type?: string
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "compliance_reports_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "engagement_metrics"
            referencedColumns: ["organization_id"]
          },
          {
            foreignKeyName: "compliance_reports_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      compliance_scores: {
        Row: {
          ai_act_score: number | null
          calculated_at: string | null
          esg_score: number | null
          gdpr_score: number | null
          id: string
          organization_id: string
          overall_score: number | null
        }
        Insert: {
          ai_act_score?: number | null
          calculated_at?: string | null
          esg_score?: number | null
          gdpr_score?: number | null
          id?: string
          organization_id: string
          overall_score?: number | null
        }
        Update: {
          ai_act_score?: number | null
          calculated_at?: string | null
          esg_score?: number | null
          gdpr_score?: number | null
          id?: string
          organization_id?: string
          overall_score?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "compliance_scores_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "engagement_metrics"
            referencedColumns: ["organization_id"]
          },
          {
            foreignKeyName: "compliance_scores_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      connector_sync_history: {
        Row: {
          connector_id: string
          error_message: string | null
          id: string
          metadata: Json | null
          organization_id: string
          records_created: number | null
          records_failed: number | null
          records_processed: number | null
          records_updated: number | null
          status: string
          sync_completed_at: string | null
          sync_started_at: string | null
          throughput_mb: number | null
        }
        Insert: {
          connector_id: string
          error_message?: string | null
          id?: string
          metadata?: Json | null
          organization_id: string
          records_created?: number | null
          records_failed?: number | null
          records_processed?: number | null
          records_updated?: number | null
          status: string
          sync_completed_at?: string | null
          sync_started_at?: string | null
          throughput_mb?: number | null
        }
        Update: {
          connector_id?: string
          error_message?: string | null
          id?: string
          metadata?: Json | null
          organization_id?: string
          records_created?: number | null
          records_failed?: number | null
          records_processed?: number | null
          records_updated?: number | null
          status?: string
          sync_completed_at?: string | null
          sync_started_at?: string | null
          throughput_mb?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "connector_sync_history_connector_id_fkey"
            columns: ["connector_id"]
            isOneToOne: false
            referencedRelation: "data_connectors"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "connector_sync_history_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "engagement_metrics"
            referencedColumns: ["organization_id"]
          },
          {
            foreignKeyName: "connector_sync_history_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      connector_sync_logs: {
        Row: {
          completed_at: string | null
          connector_id: string
          error_message: string | null
          id: string
          metadata: Json | null
          organization_id: string
          records_created: number | null
          records_failed: number | null
          records_processed: number | null
          records_updated: number | null
          started_at: string | null
          status: string
        }
        Insert: {
          completed_at?: string | null
          connector_id: string
          error_message?: string | null
          id?: string
          metadata?: Json | null
          organization_id: string
          records_created?: number | null
          records_failed?: number | null
          records_processed?: number | null
          records_updated?: number | null
          started_at?: string | null
          status: string
        }
        Update: {
          completed_at?: string | null
          connector_id?: string
          error_message?: string | null
          id?: string
          metadata?: Json | null
          organization_id?: string
          records_created?: number | null
          records_failed?: number | null
          records_processed?: number | null
          records_updated?: number | null
          started_at?: string | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "connector_sync_logs_connector_id_fkey"
            columns: ["connector_id"]
            isOneToOne: false
            referencedRelation: "connectors"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "connector_sync_logs_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "engagement_metrics"
            referencedColumns: ["organization_id"]
          },
          {
            foreignKeyName: "connector_sync_logs_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      connector_sync_state: {
        Row: {
          connector_id: string
          last_cursor: string | null
          last_row_id: number | null
          last_window_end: string | null
          last_window_start: string | null
          updated_at: string | null
        }
        Insert: {
          connector_id: string
          last_cursor?: string | null
          last_row_id?: number | null
          last_window_end?: string | null
          last_window_start?: string | null
          updated_at?: string | null
        }
        Update: {
          connector_id?: string
          last_cursor?: string | null
          last_row_id?: number | null
          last_window_end?: string | null
          last_window_start?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      connectors: {
        Row: {
          config: Json
          connector_type: Database["public"]["Enums"]["connector_type"]
          created_at: string | null
          created_by: string | null
          credentials_ref: string | null
          description: string | null
          id: string
          last_error: string | null
          last_sync_at: string | null
          last_sync_status: string | null
          name: string
          organization_id: string
          status: Database["public"]["Enums"]["connector_status"]
          sync_frequency: Database["public"]["Enums"]["sync_frequency"]
          sync_stats: Json | null
          updated_at: string | null
        }
        Insert: {
          config: Json
          connector_type: Database["public"]["Enums"]["connector_type"]
          created_at?: string | null
          created_by?: string | null
          credentials_ref?: string | null
          description?: string | null
          id?: string
          last_error?: string | null
          last_sync_at?: string | null
          last_sync_status?: string | null
          name: string
          organization_id: string
          status?: Database["public"]["Enums"]["connector_status"]
          sync_frequency?: Database["public"]["Enums"]["sync_frequency"]
          sync_stats?: Json | null
          updated_at?: string | null
        }
        Update: {
          config?: Json
          connector_type?: Database["public"]["Enums"]["connector_type"]
          created_at?: string | null
          created_by?: string | null
          credentials_ref?: string | null
          description?: string | null
          id?: string
          last_error?: string | null
          last_sync_at?: string | null
          last_sync_status?: string | null
          name?: string
          organization_id?: string
          status?: Database["public"]["Enums"]["connector_status"]
          sync_frequency?: Database["public"]["Enums"]["sync_frequency"]
          sync_stats?: Json | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "connectors_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "engagement_metrics"
            referencedColumns: ["organization_id"]
          },
          {
            foreignKeyName: "connectors_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      cron_job_logs: {
        Row: {
          completed_at: string | null
          created_at: string | null
          error_message: string | null
          id: string
          job_name: string
          records_processed: number | null
          started_at: string | null
          status: string
        }
        Insert: {
          completed_at?: string | null
          created_at?: string | null
          error_message?: string | null
          id?: string
          job_name: string
          records_processed?: number | null
          started_at?: string | null
          status?: string
        }
        Update: {
          completed_at?: string | null
          created_at?: string | null
          error_message?: string | null
          id?: string
          job_name?: string
          records_processed?: number | null
          started_at?: string | null
          status?: string
        }
        Relationships: []
      }
      data_connectors: {
        Row: {
          connection_config: Json
          connector_name: string
          connector_type: string
          created_at: string | null
          created_by: string | null
          error_count: number | null
          id: string
          is_active: boolean | null
          last_error: string | null
          last_sync_at: string | null
          organization_id: string
          sync_frequency: string | null
          sync_status: string | null
          throughput_mb: number | null
          updated_at: string | null
        }
        Insert: {
          connection_config?: Json
          connector_name: string
          connector_type: string
          created_at?: string | null
          created_by?: string | null
          error_count?: number | null
          id?: string
          is_active?: boolean | null
          last_error?: string | null
          last_sync_at?: string | null
          organization_id: string
          sync_frequency?: string | null
          sync_status?: string | null
          throughput_mb?: number | null
          updated_at?: string | null
        }
        Update: {
          connection_config?: Json
          connector_name?: string
          connector_type?: string
          created_at?: string | null
          created_by?: string | null
          error_count?: number | null
          id?: string
          is_active?: boolean | null
          last_error?: string | null
          last_sync_at?: string | null
          organization_id?: string
          sync_frequency?: string | null
          sync_status?: string | null
          throughput_mb?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "data_connectors_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "engagement_metrics"
            referencedColumns: ["organization_id"]
          },
          {
            foreignKeyName: "data_connectors_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      data_lineage_edges: {
        Row: {
          created_at: string | null
          from_reference: string
          id: string
          metadata: Json | null
          organization_id: string
          relation_type: string
          to_reference: string
        }
        Insert: {
          created_at?: string | null
          from_reference: string
          id?: string
          metadata?: Json | null
          organization_id: string
          relation_type: string
          to_reference: string
        }
        Update: {
          created_at?: string | null
          from_reference?: string
          id?: string
          metadata?: Json | null
          organization_id?: string
          relation_type?: string
          to_reference?: string
        }
        Relationships: []
      }
      data_processing_activities: {
        Row: {
          activity_name: string
          created_at: string | null
          data_categories: string[] | null
          data_subjects: string[] | null
          id: string
          legal_basis: string | null
          organization_id: string
          purpose: string | null
          recipients: string[] | null
          retention_period: string | null
          security_measures: string | null
          third_countries: string[] | null
          third_country_transfers: boolean | null
          updated_at: string | null
        }
        Insert: {
          activity_name: string
          created_at?: string | null
          data_categories?: string[] | null
          data_subjects?: string[] | null
          id?: string
          legal_basis?: string | null
          organization_id: string
          purpose?: string | null
          recipients?: string[] | null
          retention_period?: string | null
          security_measures?: string | null
          third_countries?: string[] | null
          third_country_transfers?: boolean | null
          updated_at?: string | null
        }
        Update: {
          activity_name?: string
          created_at?: string | null
          data_categories?: string[] | null
          data_subjects?: string[] | null
          id?: string
          legal_basis?: string | null
          organization_id?: string
          purpose?: string | null
          recipients?: string[] | null
          retention_period?: string | null
          security_measures?: string | null
          third_countries?: string[] | null
          third_country_transfers?: boolean | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "data_processing_activities_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "engagement_metrics"
            referencedColumns: ["organization_id"]
          },
          {
            foreignKeyName: "data_processing_activities_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      data_retention_policies: {
        Row: {
          created_at: string | null
          enabled: boolean | null
          id: string
          last_cleanup_at: string | null
          organization_id: string
          retention_days: number
          table_name: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          enabled?: boolean | null
          id?: string
          last_cleanup_at?: string | null
          organization_id: string
          retention_days?: number
          table_name: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          enabled?: boolean | null
          id?: string
          last_cleanup_at?: string | null
          organization_id?: string
          retention_days?: number
          table_name?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "data_retention_policies_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "engagement_metrics"
            referencedColumns: ["organization_id"]
          },
          {
            foreignKeyName: "data_retention_policies_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      data_sources: {
        Row: {
          checksum: string | null
          connector_id: string
          content_type: string | null
          created_at: string | null
          file_size: number | null
          id: string
          metadata: Json | null
          organization_id: string
          processed_at: string | null
          source_id: string
          source_name: string
          source_path: string | null
          source_type: string
          storage_path: string | null
          synced_at: string | null
          updated_at: string | null
        }
        Insert: {
          checksum?: string | null
          connector_id: string
          content_type?: string | null
          created_at?: string | null
          file_size?: number | null
          id?: string
          metadata?: Json | null
          organization_id: string
          processed_at?: string | null
          source_id: string
          source_name: string
          source_path?: string | null
          source_type: string
          storage_path?: string | null
          synced_at?: string | null
          updated_at?: string | null
        }
        Update: {
          checksum?: string | null
          connector_id?: string
          content_type?: string | null
          created_at?: string | null
          file_size?: number | null
          id?: string
          metadata?: Json | null
          organization_id?: string
          processed_at?: string | null
          source_id?: string
          source_name?: string
          source_path?: string | null
          source_type?: string
          storage_path?: string | null
          synced_at?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "data_sources_connector_id_fkey"
            columns: ["connector_id"]
            isOneToOne: false
            referencedRelation: "connectors"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "data_sources_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "engagement_metrics"
            referencedColumns: ["organization_id"]
          },
          {
            foreignKeyName: "data_sources_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      demo_tenants: {
        Row: {
          access_count: number | null
          created_at: string | null
          demo_type: string
          id: string
          last_reset_at: string | null
          organization_id: string | null
          read_only: boolean | null
          reset_on_reload: boolean | null
          tenant_key: string
        }
        Insert: {
          access_count?: number | null
          created_at?: string | null
          demo_type: string
          id?: string
          last_reset_at?: string | null
          organization_id?: string | null
          read_only?: boolean | null
          reset_on_reload?: boolean | null
          tenant_key: string
        }
        Update: {
          access_count?: number | null
          created_at?: string | null
          demo_type?: string
          id?: string
          last_reset_at?: string | null
          organization_id?: string | null
          read_only?: boolean | null
          reset_on_reload?: boolean | null
          tenant_key?: string
        }
        Relationships: [
          {
            foreignKeyName: "demo_tenants_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "engagement_metrics"
            referencedColumns: ["organization_id"]
          },
          {
            foreignKeyName: "demo_tenants_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      dependency_vulnerabilities: {
        Row: {
          created_at: string | null
          cvss_score: number | null
          description: string | null
          detected_at: string | null
          fixed_version: string | null
          id: string
          metadata: Json | null
          organization_id: string
          package_name: string
          package_version: string
          resolved_at: string | null
          severity: string
          source: string | null
          status: string | null
          vulnerability_id: string
        }
        Insert: {
          created_at?: string | null
          cvss_score?: number | null
          description?: string | null
          detected_at?: string | null
          fixed_version?: string | null
          id?: string
          metadata?: Json | null
          organization_id: string
          package_name: string
          package_version: string
          resolved_at?: string | null
          severity: string
          source?: string | null
          status?: string | null
          vulnerability_id: string
        }
        Update: {
          created_at?: string | null
          cvss_score?: number | null
          description?: string | null
          detected_at?: string | null
          fixed_version?: string | null
          id?: string
          metadata?: Json | null
          organization_id?: string
          package_name?: string
          package_version?: string
          resolved_at?: string | null
          severity?: string
          source?: string | null
          status?: string | null
          vulnerability_id?: string
        }
        Relationships: []
      }
      developer_submissions: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          partner_account_id: string
          payload: Json
          reviewed_at: string | null
          reviewed_by: string | null
          reviewer_notes: string | null
          status: string
          submission_type: string
          title: string
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          partner_account_id: string
          payload: Json
          reviewed_at?: string | null
          reviewed_by?: string | null
          reviewer_notes?: string | null
          status?: string
          submission_type: string
          title: string
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          partner_account_id?: string
          payload?: Json
          reviewed_at?: string | null
          reviewed_by?: string | null
          reviewer_notes?: string | null
          status?: string
          submission_type?: string
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "developer_submissions_partner_account_id_fkey"
            columns: ["partner_account_id"]
            isOneToOne: false
            referencedRelation: "partner_accounts"
            referencedColumns: ["id"]
          },
        ]
      }
      dma_assessments: {
        Row: {
          advertising_practices: string | null
          business_users: string | null
          compliance_score: number | null
          created_at: string | null
          data_practices: string | null
          gatekeeper_status: string | null
          id: string
          interoperability: string | null
          monthly_users: string
          operates_in_eu: boolean
          organization_id: string
          platform_name: string
          platform_type: string
          recommendations: string | null
          report_summary: string | null
          updated_at: string | null
        }
        Insert: {
          advertising_practices?: string | null
          business_users?: string | null
          compliance_score?: number | null
          created_at?: string | null
          data_practices?: string | null
          gatekeeper_status?: string | null
          id?: string
          interoperability?: string | null
          monthly_users: string
          operates_in_eu: boolean
          organization_id: string
          platform_name: string
          platform_type: string
          recommendations?: string | null
          report_summary?: string | null
          updated_at?: string | null
        }
        Update: {
          advertising_practices?: string | null
          business_users?: string | null
          compliance_score?: number | null
          created_at?: string | null
          data_practices?: string | null
          gatekeeper_status?: string | null
          id?: string
          interoperability?: string | null
          monthly_users?: string
          operates_in_eu?: boolean
          organization_id?: string
          platform_name?: string
          platform_type?: string
          recommendations?: string | null
          report_summary?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "dma_assessments_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "engagement_metrics"
            referencedColumns: ["organization_id"]
          },
          {
            foreignKeyName: "dma_assessments_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      document_chunks: {
        Row: {
          chunk_index: number
          content: string
          created_at: string | null
          document_id: string | null
          embedding: string | null
          id: string
          metadata: Json | null
        }
        Insert: {
          chunk_index: number
          content: string
          created_at?: string | null
          document_id?: string | null
          embedding?: string | null
          id?: string
          metadata?: Json | null
        }
        Update: {
          chunk_index?: number
          content?: string
          created_at?: string | null
          document_id?: string | null
          embedding?: string | null
          id?: string
          metadata?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "document_chunks_document_id_fkey"
            columns: ["document_id"]
            isOneToOne: false
            referencedRelation: "regulatory_documents"
            referencedColumns: ["id"]
          },
        ]
      }
      dora_assessments: {
        Row: {
          business_continuity_plan: string | null
          compliance_score: number | null
          created_at: string | null
          ict_services: string
          id: string
          incident_management: string | null
          institution_name: string
          institution_type: string
          organization_id: string
          recommendations: string | null
          recovery_time_objective: string | null
          report_summary: string | null
          risk_classification: string | null
          testing_frequency: string
          third_party_providers: string
          updated_at: string | null
        }
        Insert: {
          business_continuity_plan?: string | null
          compliance_score?: number | null
          created_at?: string | null
          ict_services: string
          id?: string
          incident_management?: string | null
          institution_name: string
          institution_type: string
          organization_id: string
          recommendations?: string | null
          recovery_time_objective?: string | null
          report_summary?: string | null
          risk_classification?: string | null
          testing_frequency: string
          third_party_providers: string
          updated_at?: string | null
        }
        Update: {
          business_continuity_plan?: string | null
          compliance_score?: number | null
          created_at?: string | null
          ict_services?: string
          id?: string
          incident_management?: string | null
          institution_name?: string
          institution_type?: string
          organization_id?: string
          recommendations?: string | null
          recovery_time_objective?: string | null
          report_summary?: string | null
          risk_classification?: string | null
          testing_frequency?: string
          third_party_providers?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "dora_assessments_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "engagement_metrics"
            referencedColumns: ["organization_id"]
          },
          {
            foreignKeyName: "dora_assessments_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      dsar_requests: {
        Row: {
          created_at: string | null
          data_subject_email: string
          deadline: string | null
          id: string
          organization_id: string
          request_type: string
          status: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          data_subject_email: string
          deadline?: string | null
          id?: string
          organization_id: string
          request_type: string
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          data_subject_email?: string
          deadline?: string | null
          id?: string
          organization_id?: string
          request_type?: string
          status?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "dsar_requests_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "engagement_metrics"
            referencedColumns: ["organization_id"]
          },
          {
            foreignKeyName: "dsar_requests_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      dsar_responses: {
        Row: {
          data_exported: Json | null
          fulfilled_at: string | null
          id: string
          request_id: string | null
          response_file_url: string | null
        }
        Insert: {
          data_exported?: Json | null
          fulfilled_at?: string | null
          id?: string
          request_id?: string | null
          response_file_url?: string | null
        }
        Update: {
          data_exported?: Json | null
          fulfilled_at?: string | null
          id?: string
          request_id?: string | null
          response_file_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "dsar_responses_request_id_fkey"
            columns: ["request_id"]
            isOneToOne: false
            referencedRelation: "dsar_requests"
            referencedColumns: ["id"]
          },
        ]
      }
      esg_connectors: {
        Row: {
          connection_config: Json
          connector_name: string
          connector_type: string
          created_at: string
          created_by: string | null
          id: string
          last_sync_at: string | null
          next_sync_at: string | null
          organization_id: string
          status: string
          sync_schedule: string | null
          updated_at: string
        }
        Insert: {
          connection_config?: Json
          connector_name: string
          connector_type: string
          created_at?: string
          created_by?: string | null
          id?: string
          last_sync_at?: string | null
          next_sync_at?: string | null
          organization_id: string
          status?: string
          sync_schedule?: string | null
          updated_at?: string
        }
        Update: {
          connection_config?: Json
          connector_name?: string
          connector_type?: string
          created_at?: string
          created_by?: string | null
          id?: string
          last_sync_at?: string | null
          next_sync_at?: string | null
          organization_id?: string
          status?: string
          sync_schedule?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "esg_connectors_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "engagement_metrics"
            referencedColumns: ["organization_id"]
          },
          {
            foreignKeyName: "esg_connectors_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      esg_data_lake: {
        Row: {
          anomaly_flags: Json | null
          audit_notes: string | null
          connector_id: string | null
          correction_history: Json | null
          created_at: string
          esrs_module: string
          id: string
          ingestion_timestamp: string
          metric_category: string
          metric_name: string
          normalized_value: Json
          organization_id: string
          processed_at: string | null
          processing_metadata: Json | null
          quality_score: number | null
          raw_value: Json
          reporting_period_end: string
          reporting_period_start: string
          source_file: string | null
          source_system: string
          source_timestamp: string
          unit: string | null
          validated_at: string | null
          validated_by: string | null
          validation_rules_applied: Json | null
          validation_status: string
          version: number
        }
        Insert: {
          anomaly_flags?: Json | null
          audit_notes?: string | null
          connector_id?: string | null
          correction_history?: Json | null
          created_at?: string
          esrs_module: string
          id?: string
          ingestion_timestamp?: string
          metric_category: string
          metric_name: string
          normalized_value: Json
          organization_id: string
          processed_at?: string | null
          processing_metadata?: Json | null
          quality_score?: number | null
          raw_value: Json
          reporting_period_end: string
          reporting_period_start: string
          source_file?: string | null
          source_system: string
          source_timestamp: string
          unit?: string | null
          validated_at?: string | null
          validated_by?: string | null
          validation_rules_applied?: Json | null
          validation_status?: string
          version?: number
        }
        Update: {
          anomaly_flags?: Json | null
          audit_notes?: string | null
          connector_id?: string | null
          correction_history?: Json | null
          created_at?: string
          esrs_module?: string
          id?: string
          ingestion_timestamp?: string
          metric_category?: string
          metric_name?: string
          normalized_value?: Json
          organization_id?: string
          processed_at?: string | null
          processing_metadata?: Json | null
          quality_score?: number | null
          raw_value?: Json
          reporting_period_end?: string
          reporting_period_start?: string
          source_file?: string | null
          source_system?: string
          source_timestamp?: string
          unit?: string | null
          validated_at?: string | null
          validated_by?: string | null
          validation_rules_applied?: Json | null
          validation_status?: string
          version?: number
        }
        Relationships: [
          {
            foreignKeyName: "esg_data_lake_connector_id_fkey"
            columns: ["connector_id"]
            isOneToOne: false
            referencedRelation: "esg_connectors"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "esg_data_lake_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "engagement_metrics"
            referencedColumns: ["organization_id"]
          },
          {
            foreignKeyName: "esg_data_lake_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      esg_data_lineage: {
        Row: {
          connector_id: string | null
          created_at: string | null
          id: string
          input_data: Json | null
          lineage_metadata: Json | null
          organization_id: string
          output_data: Json | null
          quality_score: number | null
          source_id: string | null
          transformation_type: string | null
        }
        Insert: {
          connector_id?: string | null
          created_at?: string | null
          id?: string
          input_data?: Json | null
          lineage_metadata?: Json | null
          organization_id: string
          output_data?: Json | null
          quality_score?: number | null
          source_id?: string | null
          transformation_type?: string | null
        }
        Update: {
          connector_id?: string | null
          created_at?: string | null
          id?: string
          input_data?: Json | null
          lineage_metadata?: Json | null
          organization_id?: string
          output_data?: Json | null
          quality_score?: number | null
          source_id?: string | null
          transformation_type?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "esg_data_lineage_connector_id_fkey"
            columns: ["connector_id"]
            isOneToOne: false
            referencedRelation: "esg_connectors"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "esg_data_lineage_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "engagement_metrics"
            referencedColumns: ["organization_id"]
          },
          {
            foreignKeyName: "esg_data_lineage_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "esg_data_lineage_source_id_fkey"
            columns: ["source_id"]
            isOneToOne: false
            referencedRelation: "esg_data_lake"
            referencedColumns: ["id"]
          },
        ]
      }
      esg_data_mappings: {
        Row: {
          connector_id: string
          created_at: string
          expected_data_type: string | null
          id: string
          organization_id: string
          required: boolean | null
          source_field: string
          target_esrs_module: string
          target_metric: string
          transformation_rules: Json | null
          updated_at: string
          validation_rules: Json | null
        }
        Insert: {
          connector_id: string
          created_at?: string
          expected_data_type?: string | null
          id?: string
          organization_id: string
          required?: boolean | null
          source_field: string
          target_esrs_module: string
          target_metric: string
          transformation_rules?: Json | null
          updated_at?: string
          validation_rules?: Json | null
        }
        Update: {
          connector_id?: string
          created_at?: string
          expected_data_type?: string | null
          id?: string
          organization_id?: string
          required?: boolean | null
          source_field?: string
          target_esrs_module?: string
          target_metric?: string
          transformation_rules?: Json | null
          updated_at?: string
          validation_rules?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "esg_data_mappings_connector_id_fkey"
            columns: ["connector_id"]
            isOneToOne: false
            referencedRelation: "esg_connectors"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "esg_data_mappings_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "engagement_metrics"
            referencedColumns: ["organization_id"]
          },
          {
            foreignKeyName: "esg_data_mappings_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      esg_data_quality_rules: {
        Row: {
          active: boolean | null
          created_at: string | null
          id: string
          organization_id: string
          rule_definition: Json | null
          rule_name: string
          rule_type: string | null
          severity: string | null
          target_metric: string | null
        }
        Insert: {
          active?: boolean | null
          created_at?: string | null
          id?: string
          organization_id: string
          rule_definition?: Json | null
          rule_name: string
          rule_type?: string | null
          severity?: string | null
          target_metric?: string | null
        }
        Update: {
          active?: boolean | null
          created_at?: string | null
          id?: string
          organization_id?: string
          rule_definition?: Json | null
          rule_name?: string
          rule_type?: string | null
          severity?: string | null
          target_metric?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "esg_data_quality_rules_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "engagement_metrics"
            referencedColumns: ["organization_id"]
          },
          {
            foreignKeyName: "esg_data_quality_rules_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      esg_ingestion_audit: {
        Row: {
          event_type: string
          id: string
          input_hash: string
          metadata: Json | null
          occurred_at: string | null
          organization_id: string
          output_hash: string
          prev_hash: string | null
        }
        Insert: {
          event_type: string
          id?: string
          input_hash: string
          metadata?: Json | null
          occurred_at?: string | null
          organization_id: string
          output_hash: string
          prev_hash?: string | null
        }
        Update: {
          event_type?: string
          id?: string
          input_hash?: string
          metadata?: Json | null
          occurred_at?: string | null
          organization_id?: string
          output_hash?: string
          prev_hash?: string | null
        }
        Relationships: []
      }
      esg_kpi_results: {
        Row: {
          computed_at: string | null
          id: string
          lineage: Json | null
          metric_code: string
          organization_id: string
          period: string
          quality_score: number | null
          source_profile_id: string | null
          unit: string | null
          value: number
        }
        Insert: {
          computed_at?: string | null
          id?: string
          lineage?: Json | null
          metric_code: string
          organization_id: string
          period: string
          quality_score?: number | null
          source_profile_id?: string | null
          unit?: string | null
          value: number
        }
        Update: {
          computed_at?: string | null
          id?: string
          lineage?: Json | null
          metric_code?: string
          organization_id?: string
          period?: string
          quality_score?: number | null
          source_profile_id?: string | null
          unit?: string | null
          value?: number
        }
        Relationships: []
      }
      esg_kpi_rules: {
        Row: {
          active: boolean | null
          created_at: string | null
          esrs_reference: string | null
          formula: Json
          id: string
          metric_code: string
          organization_id: string
          unit: string | null
          version: number | null
        }
        Insert: {
          active?: boolean | null
          created_at?: string | null
          esrs_reference?: string | null
          formula: Json
          id?: string
          metric_code: string
          organization_id: string
          unit?: string | null
          version?: number | null
        }
        Update: {
          active?: boolean | null
          created_at?: string | null
          esrs_reference?: string | null
          formula?: Json
          id?: string
          metric_code?: string
          organization_id?: string
          unit?: string | null
          version?: number | null
        }
        Relationships: []
      }
      esg_kpis: {
        Row: {
          calculation_method: string | null
          confidence_score: number | null
          data_sources: string[] | null
          esrs_module: string
          extracted_at: string | null
          fiscal_year: number | null
          id: string
          kpi_name: string
          kpi_unit: string | null
          kpi_value: number | null
          metadata: Json | null
          organization_id: string
          validated: boolean | null
        }
        Insert: {
          calculation_method?: string | null
          confidence_score?: number | null
          data_sources?: string[] | null
          esrs_module: string
          extracted_at?: string | null
          fiscal_year?: number | null
          id?: string
          kpi_name: string
          kpi_unit?: string | null
          kpi_value?: number | null
          metadata?: Json | null
          organization_id: string
          validated?: boolean | null
        }
        Update: {
          calculation_method?: string | null
          confidence_score?: number | null
          data_sources?: string[] | null
          esrs_module?: string
          extracted_at?: string | null
          fiscal_year?: number | null
          id?: string
          kpi_name?: string
          kpi_unit?: string | null
          kpi_value?: number | null
          metadata?: Json | null
          organization_id?: string
          validated?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "esg_kpis_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "engagement_metrics"
            referencedColumns: ["organization_id"]
          },
          {
            foreignKeyName: "esg_kpis_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      esg_metrics: {
        Row: {
          created_at: string | null
          id: string
          metric_category: string
          metric_code: string | null
          metric_name: string
          notes: string | null
          organization_id: string
          reporting_period: string
          source: string | null
          unit: string | null
          value: number | null
          verified: boolean | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          metric_category: string
          metric_code?: string | null
          metric_name: string
          notes?: string | null
          organization_id: string
          reporting_period: string
          source?: string | null
          unit?: string | null
          value?: number | null
          verified?: boolean | null
        }
        Update: {
          created_at?: string | null
          id?: string
          metric_category?: string
          metric_code?: string | null
          metric_name?: string
          notes?: string | null
          organization_id?: string
          reporting_period?: string
          source?: string | null
          unit?: string | null
          value?: number | null
          verified?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "esg_metrics_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "engagement_metrics"
            referencedColumns: ["organization_id"]
          },
          {
            foreignKeyName: "esg_metrics_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      esg_regulation_updates: {
        Row: {
          detected_at: string | null
          effective_date: string | null
          id: string
          impact_assessment: string | null
          metadata: Json | null
          regulation_name: string
          regulation_type: string | null
          summary: string | null
          version: string | null
        }
        Insert: {
          detected_at?: string | null
          effective_date?: string | null
          id?: string
          impact_assessment?: string | null
          metadata?: Json | null
          regulation_name: string
          regulation_type?: string | null
          summary?: string | null
          version?: string | null
        }
        Update: {
          detected_at?: string | null
          effective_date?: string | null
          id?: string
          impact_assessment?: string | null
          metadata?: Json | null
          regulation_name?: string
          regulation_type?: string | null
          summary?: string | null
          version?: string | null
        }
        Relationships: []
      }
      esg_reports: {
        Row: {
          anomalies_detected: string[] | null
          completeness_score: number | null
          created_at: string | null
          id: string
          metrics_summary: Json | null
          narrative_sections: Json | null
          organization_id: string
          report_url: string | null
          reporting_period: string
          status: string | null
        }
        Insert: {
          anomalies_detected?: string[] | null
          completeness_score?: number | null
          created_at?: string | null
          id?: string
          metrics_summary?: Json | null
          narrative_sections?: Json | null
          organization_id: string
          report_url?: string | null
          reporting_period: string
          status?: string | null
        }
        Update: {
          anomalies_detected?: string[] | null
          completeness_score?: number | null
          created_at?: string | null
          id?: string
          metrics_summary?: Json | null
          narrative_sections?: Json | null
          organization_id?: string
          report_url?: string | null
          reporting_period?: string
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "esg_reports_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "engagement_metrics"
            referencedColumns: ["organization_id"]
          },
          {
            foreignKeyName: "esg_reports_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      esg_sync_logs: {
        Row: {
          connector_id: string
          created_at: string
          error_details: Json | null
          execution_log: string | null
          id: string
          organization_id: string
          records_failed: number | null
          records_processed: number | null
          records_validated: number | null
          status: string
          sync_completed_at: string | null
          sync_started_at: string
        }
        Insert: {
          connector_id: string
          created_at?: string
          error_details?: Json | null
          execution_log?: string | null
          id?: string
          organization_id: string
          records_failed?: number | null
          records_processed?: number | null
          records_validated?: number | null
          status: string
          sync_completed_at?: string | null
          sync_started_at?: string
        }
        Update: {
          connector_id?: string
          created_at?: string
          error_details?: Json | null
          execution_log?: string | null
          id?: string
          organization_id?: string
          records_failed?: number | null
          records_processed?: number | null
          records_validated?: number | null
          status?: string
          sync_completed_at?: string | null
          sync_started_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "esg_sync_logs_connector_id_fkey"
            columns: ["connector_id"]
            isOneToOne: false
            referencedRelation: "esg_connectors"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "esg_sync_logs_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "engagement_metrics"
            referencedColumns: ["organization_id"]
          },
          {
            foreignKeyName: "esg_sync_logs_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      esrs_modules: {
        Row: {
          created_at: string
          description: string | null
          id: string
          materiality_assessment_required: boolean | null
          module_category: string
          module_code: string
          module_name: string
          regulatory_reference: string | null
          required_disclosures: Json
          required_kpis: Json
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          materiality_assessment_required?: boolean | null
          module_category: string
          module_code: string
          module_name: string
          regulatory_reference?: string | null
          required_disclosures?: Json
          required_kpis?: Json
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          materiality_assessment_required?: boolean | null
          module_category?: string
          module_code?: string
          module_name?: string
          regulatory_reference?: string | null
          required_disclosures?: Json
          required_kpis?: Json
        }
        Relationships: []
      }
      explainability_views: {
        Row: {
          answer: string | null
          assessment_id: string | null
          assessment_type: string | null
          created_at: string | null
          evidence_chunks: Json | null
          id: string
          user_question: string | null
        }
        Insert: {
          answer?: string | null
          assessment_id?: string | null
          assessment_type?: string | null
          created_at?: string | null
          evidence_chunks?: Json | null
          id?: string
          user_question?: string | null
        }
        Update: {
          answer?: string | null
          assessment_id?: string | null
          assessment_type?: string | null
          created_at?: string | null
          evidence_chunks?: Json | null
          id?: string
          user_question?: string | null
        }
        Relationships: []
      }
      federated_learning_rounds: {
        Row: {
          aggregated_metrics: Json | null
          completed_at: string | null
          id: string
          model_version: string
          participating_orgs: number | null
          privacy_guarantee: string | null
          round_number: number
          started_at: string | null
        }
        Insert: {
          aggregated_metrics?: Json | null
          completed_at?: string | null
          id?: string
          model_version: string
          participating_orgs?: number | null
          privacy_guarantee?: string | null
          round_number: number
          started_at?: string | null
        }
        Update: {
          aggregated_metrics?: Json | null
          completed_at?: string | null
          id?: string
          model_version?: string
          participating_orgs?: number | null
          privacy_guarantee?: string | null
          round_number?: number
          started_at?: string | null
        }
        Relationships: []
      }
      gdpr_assessments: {
        Row: {
          assessment_date: string | null
          assessor_id: string | null
          created_at: string | null
          findings: Json | null
          id: string
          organization_id: string
          status: string | null
          summary: string | null
          violations: Json | null
        }
        Insert: {
          assessment_date?: string | null
          assessor_id?: string | null
          created_at?: string | null
          findings?: Json | null
          id?: string
          organization_id: string
          status?: string | null
          summary?: string | null
          violations?: Json | null
        }
        Update: {
          assessment_date?: string | null
          assessor_id?: string | null
          created_at?: string | null
          findings?: Json | null
          id?: string
          organization_id?: string
          status?: string | null
          summary?: string | null
          violations?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "gdpr_assessments_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "engagement_metrics"
            referencedColumns: ["organization_id"]
          },
          {
            foreignKeyName: "gdpr_assessments_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      growth_metrics: {
        Row: {
          active_organizations: number | null
          active_partners: number | null
          api_calls_total: number | null
          churn_count: number | null
          connector_usage: Json | null
          country_distribution: Json | null
          created_at: string | null
          id: string
          metadata: Json | null
          metric_date: string
          module_usage: Json | null
          new_signups: number | null
          revenue_total: number | null
          sector_distribution: Json | null
        }
        Insert: {
          active_organizations?: number | null
          active_partners?: number | null
          api_calls_total?: number | null
          churn_count?: number | null
          connector_usage?: Json | null
          country_distribution?: Json | null
          created_at?: string | null
          id?: string
          metadata?: Json | null
          metric_date: string
          module_usage?: Json | null
          new_signups?: number | null
          revenue_total?: number | null
          sector_distribution?: Json | null
        }
        Update: {
          active_organizations?: number | null
          active_partners?: number | null
          api_calls_total?: number | null
          churn_count?: number | null
          connector_usage?: Json | null
          country_distribution?: Json | null
          created_at?: string | null
          id?: string
          metadata?: Json | null
          metric_date?: string
          module_usage?: Json | null
          new_signups?: number | null
          revenue_total?: number | null
          sector_distribution?: Json | null
        }
        Relationships: []
      }
      help_articles: {
        Row: {
          category: string
          content: string
          created_at: string | null
          helpful_count: number | null
          id: string
          language: string
          metadata: Json | null
          screenshot_url: string | null
          slug: string
          tags: string[] | null
          title: string
          unhelpful_count: number | null
          updated_at: string | null
          video_url: string | null
          view_count: number | null
        }
        Insert: {
          category: string
          content: string
          created_at?: string | null
          helpful_count?: number | null
          id?: string
          language?: string
          metadata?: Json | null
          screenshot_url?: string | null
          slug: string
          tags?: string[] | null
          title: string
          unhelpful_count?: number | null
          updated_at?: string | null
          video_url?: string | null
          view_count?: number | null
        }
        Update: {
          category?: string
          content?: string
          created_at?: string | null
          helpful_count?: number | null
          id?: string
          language?: string
          metadata?: Json | null
          screenshot_url?: string | null
          slug?: string
          tags?: string[] | null
          title?: string
          unhelpful_count?: number | null
          updated_at?: string | null
          video_url?: string | null
          view_count?: number | null
        }
        Relationships: []
      }
      help_feedback: {
        Row: {
          comment: string | null
          created_at: string | null
          doc_path: string
          helpful: boolean
          id: string
          language: string | null
          user_id: string | null
        }
        Insert: {
          comment?: string | null
          created_at?: string | null
          doc_path: string
          helpful: boolean
          id?: string
          language?: string | null
          user_id?: string | null
        }
        Update: {
          comment?: string | null
          created_at?: string | null
          doc_path?: string
          helpful?: boolean
          id?: string
          language?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      help_search_logs: {
        Row: {
          created_at: string | null
          id: string
          language: string | null
          query: string
          result_count: number | null
          result_found: boolean
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          language?: string | null
          query: string
          result_count?: number | null
          result_found: boolean
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          language?: string | null
          query?: string
          result_count?: number | null
          result_found?: boolean
          user_id?: string | null
        }
        Relationships: []
      }
      integration_audit_logs: {
        Row: {
          action: string
          auth_method: string | null
          connector_id: string | null
          endpoint: string | null
          error_message: string | null
          external_system: string
          id: string
          metadata: Json | null
          organization_id: string
          partner_account_id: string | null
          records_processed: number | null
          status: string
          timestamp: string | null
        }
        Insert: {
          action: string
          auth_method?: string | null
          connector_id?: string | null
          endpoint?: string | null
          error_message?: string | null
          external_system: string
          id?: string
          metadata?: Json | null
          organization_id: string
          partner_account_id?: string | null
          records_processed?: number | null
          status: string
          timestamp?: string | null
        }
        Update: {
          action?: string
          auth_method?: string | null
          connector_id?: string | null
          endpoint?: string | null
          error_message?: string | null
          external_system?: string
          id?: string
          metadata?: Json | null
          organization_id?: string
          partner_account_id?: string | null
          records_processed?: number | null
          status?: string
          timestamp?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "integration_audit_logs_connector_id_fkey"
            columns: ["connector_id"]
            isOneToOne: false
            referencedRelation: "connectors"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "integration_audit_logs_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "engagement_metrics"
            referencedColumns: ["organization_id"]
          },
          {
            foreignKeyName: "integration_audit_logs_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "integration_audit_logs_partner_account_id_fkey"
            columns: ["partner_account_id"]
            isOneToOne: false
            referencedRelation: "partner_accounts"
            referencedColumns: ["id"]
          },
        ]
      }
      intelligence_scores: {
        Row: {
          automation_score: number | null
          calculated_at: string | null
          coverage_score: number | null
          explainability_score: number | null
          id: string
          organization_id: string
          overall_score: number | null
          response_score: number | null
        }
        Insert: {
          automation_score?: number | null
          calculated_at?: string | null
          coverage_score?: number | null
          explainability_score?: number | null
          id?: string
          organization_id: string
          overall_score?: number | null
          response_score?: number | null
        }
        Update: {
          automation_score?: number | null
          calculated_at?: string | null
          coverage_score?: number | null
          explainability_score?: number | null
          id?: string
          organization_id?: string
          overall_score?: number | null
          response_score?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "intelligence_scores_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "engagement_metrics"
            referencedColumns: ["organization_id"]
          },
          {
            foreignKeyName: "intelligence_scores_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      login_attempts: {
        Row: {
          created_at: string | null
          id: string
          ip_address: unknown
          organization_id: string | null
          success: boolean
          user_agent: string | null
          user_email: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          ip_address?: unknown
          organization_id?: string | null
          success: boolean
          user_agent?: string | null
          user_email: string
        }
        Update: {
          created_at?: string | null
          id?: string
          ip_address?: unknown
          organization_id?: string | null
          success?: boolean
          user_agent?: string | null
          user_email?: string
        }
        Relationships: [
          {
            foreignKeyName: "login_attempts_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "engagement_metrics"
            referencedColumns: ["organization_id"]
          },
          {
            foreignKeyName: "login_attempts_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      mapping_fields: {
        Row: {
          created_at: string | null
          id: string
          notes: string | null
          profile_id: string
          source_column: string
          source_table: string
          target_metric_code: string
          transform: Json | null
          unit: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          notes?: string | null
          profile_id: string
          source_column: string
          source_table: string
          target_metric_code: string
          transform?: Json | null
          unit?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          notes?: string | null
          profile_id?: string
          source_column?: string
          source_table?: string
          target_metric_code?: string
          transform?: Json | null
          unit?: string | null
        }
        Relationships: []
      }
      mapping_joins: {
        Row: {
          confidence_score: number | null
          created_at: string | null
          id: string
          join_type: string
          left_key: string
          left_table: string
          profile_id: string
          right_key: string
          right_table: string
        }
        Insert: {
          confidence_score?: number | null
          created_at?: string | null
          id?: string
          join_type?: string
          left_key: string
          left_table: string
          profile_id: string
          right_key: string
          right_table: string
        }
        Update: {
          confidence_score?: number | null
          created_at?: string | null
          id?: string
          join_type?: string
          left_key?: string
          left_table?: string
          profile_id?: string
          right_key?: string
          right_table?: string
        }
        Relationships: []
      }
      mapping_profiles: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          name: string
          organization_id: string
          status: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          name: string
          organization_id: string
          status?: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          name?: string
          organization_id?: string
          status?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      mapping_tables: {
        Row: {
          connector_id: string | null
          created_at: string | null
          id: string
          profile_id: string
          source_table: string
          table_alias: string | null
        }
        Insert: {
          connector_id?: string | null
          created_at?: string | null
          id?: string
          profile_id: string
          source_table: string
          table_alias?: string | null
        }
        Update: {
          connector_id?: string | null
          created_at?: string | null
          id?: string
          profile_id?: string
          source_table?: string
          table_alias?: string | null
        }
        Relationships: []
      }
      marketing_events: {
        Row: {
          consent_given: boolean | null
          created_at: string | null
          event_category: string | null
          event_type: string
          id: string
          ip_address: unknown
          metadata: Json | null
          organization_id: string | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          consent_given?: boolean | null
          created_at?: string | null
          event_category?: string | null
          event_type: string
          id?: string
          ip_address?: unknown
          metadata?: Json | null
          organization_id?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          consent_given?: boolean | null
          created_at?: string | null
          event_category?: string | null
          event_type?: string
          id?: string
          ip_address?: unknown
          metadata?: Json | null
          organization_id?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "marketing_events_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "engagement_metrics"
            referencedColumns: ["organization_id"]
          },
          {
            foreignKeyName: "marketing_events_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      marketplace_plugins: {
        Row: {
          approved_at: string | null
          approved_by: string | null
          average_rating: number | null
          category: string | null
          configuration_schema: Json | null
          created_at: string | null
          currency: string | null
          description: string | null
          developer_partner_id: string | null
          documentation_url: string | null
          github_url: string | null
          homepage_url: string | null
          icon_url: string | null
          id: string
          install_count: number | null
          long_description: string | null
          metadata: Json | null
          plugin_name: string
          plugin_type: string
          price_amount: number | null
          price_model: string
          requires_api_key: boolean | null
          review_count: number | null
          status: string
          submitted_at: string | null
          support_email: string | null
          tags: string[] | null
          updated_at: string | null
          version: string
        }
        Insert: {
          approved_at?: string | null
          approved_by?: string | null
          average_rating?: number | null
          category?: string | null
          configuration_schema?: Json | null
          created_at?: string | null
          currency?: string | null
          description?: string | null
          developer_partner_id?: string | null
          documentation_url?: string | null
          github_url?: string | null
          homepage_url?: string | null
          icon_url?: string | null
          id?: string
          install_count?: number | null
          long_description?: string | null
          metadata?: Json | null
          plugin_name: string
          plugin_type: string
          price_amount?: number | null
          price_model?: string
          requires_api_key?: boolean | null
          review_count?: number | null
          status?: string
          submitted_at?: string | null
          support_email?: string | null
          tags?: string[] | null
          updated_at?: string | null
          version?: string
        }
        Update: {
          approved_at?: string | null
          approved_by?: string | null
          average_rating?: number | null
          category?: string | null
          configuration_schema?: Json | null
          created_at?: string | null
          currency?: string | null
          description?: string | null
          developer_partner_id?: string | null
          documentation_url?: string | null
          github_url?: string | null
          homepage_url?: string | null
          icon_url?: string | null
          id?: string
          install_count?: number | null
          long_description?: string | null
          metadata?: Json | null
          plugin_name?: string
          plugin_type?: string
          price_amount?: number | null
          price_model?: string
          requires_api_key?: boolean | null
          review_count?: number | null
          status?: string
          submitted_at?: string | null
          support_email?: string | null
          tags?: string[] | null
          updated_at?: string | null
          version?: string
        }
        Relationships: [
          {
            foreignKeyName: "marketplace_plugins_developer_partner_id_fkey"
            columns: ["developer_partner_id"]
            isOneToOne: false
            referencedRelation: "partner_accounts"
            referencedColumns: ["id"]
          },
        ]
      }
      mcp_agents: {
        Row: {
          created_at: string | null
          endpoint: string
          input_schema: Json
          name: string
          output_schema: Json
          policy: Json | null
          version: string
        }
        Insert: {
          created_at?: string | null
          endpoint: string
          input_schema: Json
          name: string
          output_schema: Json
          policy?: Json | null
          version: string
        }
        Update: {
          created_at?: string | null
          endpoint?: string
          input_schema?: Json
          name?: string
          output_schema?: Json
          policy?: Json | null
          version?: string
        }
        Relationships: []
      }
      mfa_backup_codes: {
        Row: {
          code_hash: string
          created_at: string | null
          id: string
          used_at: string | null
          user_id: string
        }
        Insert: {
          code_hash: string
          created_at?: string | null
          id?: string
          used_at?: string | null
          user_id: string
        }
        Update: {
          code_hash?: string
          created_at?: string | null
          id?: string
          used_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      ml_models: {
        Row: {
          bias_documentation: string | null
          created_at: string | null
          deployment_date: string | null
          framework: string | null
          id: string
          model_type: string | null
          name: string
          organization_id: string
          performance_metrics: Json | null
          purpose: string | null
          risk_tags: string[] | null
          updated_at: string | null
          version: string | null
        }
        Insert: {
          bias_documentation?: string | null
          created_at?: string | null
          deployment_date?: string | null
          framework?: string | null
          id?: string
          model_type?: string | null
          name: string
          organization_id: string
          performance_metrics?: Json | null
          purpose?: string | null
          risk_tags?: string[] | null
          updated_at?: string | null
          version?: string | null
        }
        Update: {
          bias_documentation?: string | null
          created_at?: string | null
          deployment_date?: string | null
          framework?: string | null
          id?: string
          model_type?: string | null
          name?: string
          organization_id?: string
          performance_metrics?: Json | null
          purpose?: string | null
          risk_tags?: string[] | null
          updated_at?: string | null
          version?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ml_models_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "engagement_metrics"
            referencedColumns: ["organization_id"]
          },
          {
            foreignKeyName: "ml_models_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      model_cards: {
        Row: {
          accuracy_metrics: Json | null
          bias_assessment: Json | null
          carbon_footprint_kg: number | null
          created_at: string | null
          created_by: string | null
          ethical_considerations: string | null
          id: string
          intended_use: string | null
          last_evaluated_at: string | null
          limitations: string | null
          model_name: string
          model_type: string
          organization_id: string
          provider: string
          training_data_description: string | null
          updated_at: string | null
          version: string
        }
        Insert: {
          accuracy_metrics?: Json | null
          bias_assessment?: Json | null
          carbon_footprint_kg?: number | null
          created_at?: string | null
          created_by?: string | null
          ethical_considerations?: string | null
          id?: string
          intended_use?: string | null
          last_evaluated_at?: string | null
          limitations?: string | null
          model_name: string
          model_type: string
          organization_id: string
          provider: string
          training_data_description?: string | null
          updated_at?: string | null
          version: string
        }
        Update: {
          accuracy_metrics?: Json | null
          bias_assessment?: Json | null
          carbon_footprint_kg?: number | null
          created_at?: string | null
          created_by?: string | null
          ethical_considerations?: string | null
          id?: string
          intended_use?: string | null
          last_evaluated_at?: string | null
          limitations?: string | null
          model_name?: string
          model_type?: string
          organization_id?: string
          provider?: string
          training_data_description?: string | null
          updated_at?: string | null
          version?: string
        }
        Relationships: [
          {
            foreignKeyName: "model_cards_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "engagement_metrics"
            referencedColumns: ["organization_id"]
          },
          {
            foreignKeyName: "model_cards_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      model_configs: {
        Row: {
          active: boolean | null
          api_key_ref: string | null
          base_url: string | null
          created_at: string | null
          id: string
          model_name: string
          organization_id: string
          price_per_1k_tokens: number
          provider: string
          updated_at: string | null
        }
        Insert: {
          active?: boolean | null
          api_key_ref?: string | null
          base_url?: string | null
          created_at?: string | null
          id?: string
          model_name: string
          organization_id: string
          price_per_1k_tokens?: number
          provider: string
          updated_at?: string | null
        }
        Update: {
          active?: boolean | null
          api_key_ref?: string | null
          base_url?: string | null
          created_at?: string | null
          id?: string
          model_name?: string
          organization_id?: string
          price_per_1k_tokens?: number
          provider?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "model_configs_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "engagement_metrics"
            referencedColumns: ["organization_id"]
          },
          {
            foreignKeyName: "model_configs_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      model_datasets: {
        Row: {
          created_at: string | null
          dataset_name: string
          dataset_url: string | null
          description: string | null
          id: string
          model_id: string | null
          size_records: number | null
        }
        Insert: {
          created_at?: string | null
          dataset_name: string
          dataset_url?: string | null
          description?: string | null
          id?: string
          model_id?: string | null
          size_records?: number | null
        }
        Update: {
          created_at?: string | null
          dataset_name?: string
          dataset_url?: string | null
          description?: string | null
          id?: string
          model_id?: string | null
          size_records?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "model_datasets_model_id_fkey"
            columns: ["model_id"]
            isOneToOne: false
            referencedRelation: "ml_models"
            referencedColumns: ["id"]
          },
        ]
      }
      model_usage_logs: {
        Row: {
          completion_tokens: number | null
          cost_estimate: number
          created_at: string
          custom_endpoint: string | null
          error_message: string | null
          id: string
          model: string
          organization_id: string
          prompt_tokens: number | null
          request_payload: Json | null
          response_summary: Json | null
          status: string
          timestamp: string
          total_tokens: number
        }
        Insert: {
          completion_tokens?: number | null
          cost_estimate?: number
          created_at?: string
          custom_endpoint?: string | null
          error_message?: string | null
          id?: string
          model: string
          organization_id: string
          prompt_tokens?: number | null
          request_payload?: Json | null
          response_summary?: Json | null
          status?: string
          timestamp?: string
          total_tokens: number
        }
        Update: {
          completion_tokens?: number | null
          cost_estimate?: number
          created_at?: string
          custom_endpoint?: string | null
          error_message?: string | null
          id?: string
          model?: string
          organization_id?: string
          prompt_tokens?: number | null
          request_payload?: Json | null
          response_summary?: Json | null
          status?: string
          timestamp?: string
          total_tokens?: number
        }
        Relationships: [
          {
            foreignKeyName: "model_usage_logs_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "engagement_metrics"
            referencedColumns: ["organization_id"]
          },
          {
            foreignKeyName: "model_usage_logs_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      module_settings: {
        Row: {
          config: Json | null
          created_at: string
          enabled: boolean
          id: string
          module_name: string
          organization_id: string
          updated_at: string
        }
        Insert: {
          config?: Json | null
          created_at?: string
          enabled?: boolean
          id?: string
          module_name: string
          organization_id: string
          updated_at?: string
        }
        Update: {
          config?: Json | null
          created_at?: string
          enabled?: boolean
          id?: string
          module_name?: string
          organization_id?: string
          updated_at?: string
        }
        Relationships: []
      }
      nis2_assessments: {
        Row: {
          compliance_score: number | null
          created_at: string | null
          critical_services: string | null
          entity_type: string
          id: string
          incident_response: string | null
          organization_id: string
          organization_name: string
          organization_type: string
          recommendations: string | null
          report_summary: string | null
          risk_classification: string | null
          sectors: string
          updated_at: string | null
          vulnerability_management: string | null
        }
        Insert: {
          compliance_score?: number | null
          created_at?: string | null
          critical_services?: string | null
          entity_type: string
          id?: string
          incident_response?: string | null
          organization_id: string
          organization_name: string
          organization_type: string
          recommendations?: string | null
          report_summary?: string | null
          risk_classification?: string | null
          sectors: string
          updated_at?: string | null
          vulnerability_management?: string | null
        }
        Update: {
          compliance_score?: number | null
          created_at?: string | null
          critical_services?: string | null
          entity_type?: string
          id?: string
          incident_response?: string | null
          organization_id?: string
          organization_name?: string
          organization_type?: string
          recommendations?: string | null
          report_summary?: string | null
          risk_classification?: string | null
          sectors?: string
          updated_at?: string | null
          vulnerability_management?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "nis2_assessments_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "engagement_metrics"
            referencedColumns: ["organization_id"]
          },
          {
            foreignKeyName: "nis2_assessments_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      onboarding_checklists: {
        Row: {
          completed: boolean | null
          completed_at: string | null
          completed_by: string | null
          created_at: string | null
          id: string
          organization_id: string
          task_key: string
          task_name: string
          task_order: number
          updated_at: string | null
        }
        Insert: {
          completed?: boolean | null
          completed_at?: string | null
          completed_by?: string | null
          created_at?: string | null
          id?: string
          organization_id: string
          task_key: string
          task_name: string
          task_order?: number
          updated_at?: string | null
        }
        Update: {
          completed?: boolean | null
          completed_at?: string | null
          completed_by?: string | null
          created_at?: string | null
          id?: string
          organization_id?: string
          task_key?: string
          task_name?: string
          task_order?: number
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "onboarding_checklists_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "engagement_metrics"
            referencedColumns: ["organization_id"]
          },
          {
            foreignKeyName: "onboarding_checklists_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      onboarding_events: {
        Row: {
          created_at: string | null
          event_data: Json | null
          event_name: string
          id: string
          organization_id: string | null
          step_number: number | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          event_data?: Json | null
          event_name: string
          id?: string
          organization_id?: string | null
          step_number?: number | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          event_data?: Json | null
          event_name?: string
          id?: string
          organization_id?: string | null
          step_number?: number | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "onboarding_events_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "engagement_metrics"
            referencedColumns: ["organization_id"]
          },
          {
            foreignKeyName: "onboarding_events_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      org_policies: {
        Row: {
          content: string
          created_at: string | null
          embedding: string | null
          id: string
          metadata: Json | null
          organization_id: string | null
          title: string
          updated_at: string | null
        }
        Insert: {
          content: string
          created_at?: string | null
          embedding?: string | null
          id?: string
          metadata?: Json | null
          organization_id?: string | null
          title: string
          updated_at?: string | null
        }
        Update: {
          content?: string
          created_at?: string | null
          embedding?: string | null
          id?: string
          metadata?: Json | null
          organization_id?: string | null
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "org_policies_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "engagement_metrics"
            referencedColumns: ["organization_id"]
          },
          {
            foreignKeyName: "org_policies_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      organization_budgets: {
        Row: {
          created_at: string
          custom_api_url: string | null
          daily_cost_limit_usd: number
          daily_token_limit: number
          fallback_model: string
          id: string
          organization_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          custom_api_url?: string | null
          daily_cost_limit_usd?: number
          daily_token_limit?: number
          fallback_model?: string
          id?: string
          organization_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          custom_api_url?: string | null
          daily_cost_limit_usd?: number
          daily_token_limit?: number
          fallback_model?: string
          id?: string
          organization_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "organization_budgets_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: true
            referencedRelation: "engagement_metrics"
            referencedColumns: ["organization_id"]
          },
          {
            foreignKeyName: "organization_budgets_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: true
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      organization_domains: {
        Row: {
          created_at: string | null
          created_by: string | null
          domain: string
          id: string
          organization_id: string
          verification_token: string | null
          verified: boolean | null
          verified_at: string | null
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          domain: string
          id?: string
          organization_id: string
          verification_token?: string | null
          verified?: boolean | null
          verified_at?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          domain?: string
          id?: string
          organization_id?: string
          verification_token?: string | null
          verified?: boolean | null
          verified_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "organization_domains_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "engagement_metrics"
            referencedColumns: ["organization_id"]
          },
          {
            foreignKeyName: "organization_domains_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      organization_invites: {
        Row: {
          accepted_at: string | null
          created_at: string | null
          email: string
          expires_at: string | null
          id: string
          invite_token: string
          invited_by: string
          organization_id: string
          role: Database["public"]["Enums"]["app_role"] | null
          status: string | null
        }
        Insert: {
          accepted_at?: string | null
          created_at?: string | null
          email: string
          expires_at?: string | null
          id?: string
          invite_token: string
          invited_by: string
          organization_id: string
          role?: Database["public"]["Enums"]["app_role"] | null
          status?: string | null
        }
        Update: {
          accepted_at?: string | null
          created_at?: string | null
          email?: string
          expires_at?: string | null
          id?: string
          invite_token?: string
          invited_by?: string
          organization_id?: string
          role?: Database["public"]["Enums"]["app_role"] | null
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "organization_invites_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "engagement_metrics"
            referencedColumns: ["organization_id"]
          },
          {
            foreignKeyName: "organization_invites_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      organizations: {
        Row: {
          billing_model: string
          byok_api_key_encrypted: string | null
          byok_model: string | null
          byok_provider: string | null
          certification_level: string | null
          company_size: string | null
          country_code: string | null
          created_at: string | null
          custom_domain: string | null
          data_residency_region: string | null
          document_retention_years: number | null
          id: string
          industry: string | null
          is_public_sector: boolean | null
          is_whitelabel: boolean | null
          llm_token_quota: number
          name: string
          partner_id: string | null
          plan: string | null
          public_key: string | null
          quota_reset_date: string | null
          reseller_branding: Json | null
          signing_key_id: string | null
          stripe_customer_id: string | null
          stripe_subscription_id: string | null
          subscription_plan: string | null
          subscription_status: string | null
          tier: string | null
          tokens_used_this_month: number
          trial_end_date: string | null
        }
        Insert: {
          billing_model?: string
          byok_api_key_encrypted?: string | null
          byok_model?: string | null
          byok_provider?: string | null
          certification_level?: string | null
          company_size?: string | null
          country_code?: string | null
          created_at?: string | null
          custom_domain?: string | null
          data_residency_region?: string | null
          document_retention_years?: number | null
          id?: string
          industry?: string | null
          is_public_sector?: boolean | null
          is_whitelabel?: boolean | null
          llm_token_quota?: number
          name: string
          partner_id?: string | null
          plan?: string | null
          public_key?: string | null
          quota_reset_date?: string | null
          reseller_branding?: Json | null
          signing_key_id?: string | null
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          subscription_plan?: string | null
          subscription_status?: string | null
          tier?: string | null
          tokens_used_this_month?: number
          trial_end_date?: string | null
        }
        Update: {
          billing_model?: string
          byok_api_key_encrypted?: string | null
          byok_model?: string | null
          byok_provider?: string | null
          certification_level?: string | null
          company_size?: string | null
          country_code?: string | null
          created_at?: string | null
          custom_domain?: string | null
          data_residency_region?: string | null
          document_retention_years?: number | null
          id?: string
          industry?: string | null
          is_public_sector?: boolean | null
          is_whitelabel?: boolean | null
          llm_token_quota?: number
          name?: string
          partner_id?: string | null
          plan?: string | null
          public_key?: string | null
          quota_reset_date?: string | null
          reseller_branding?: Json | null
          signing_key_id?: string | null
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          subscription_plan?: string | null
          subscription_status?: string | null
          tier?: string | null
          tokens_used_this_month?: number
          trial_end_date?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "organizations_partner_id_fkey"
            columns: ["partner_id"]
            isOneToOne: false
            referencedRelation: "partner_accounts"
            referencedColumns: ["id"]
          },
        ]
      }
      partner_accounts: {
        Row: {
          api_rate_limit: number | null
          approved_at: string | null
          approved_by: string | null
          company_email: string
          company_website: string | null
          contract_end_date: string | null
          contract_start_date: string | null
          created_at: string | null
          id: string
          metadata: Json | null
          monthly_quota: number | null
          organization_id: string | null
          partner_name: string
          partner_type: string
          revenue_share_percent: number | null
          status: string
          tier: string
          updated_at: string | null
          usage_this_month: number | null
        }
        Insert: {
          api_rate_limit?: number | null
          approved_at?: string | null
          approved_by?: string | null
          company_email: string
          company_website?: string | null
          contract_end_date?: string | null
          contract_start_date?: string | null
          created_at?: string | null
          id?: string
          metadata?: Json | null
          monthly_quota?: number | null
          organization_id?: string | null
          partner_name: string
          partner_type: string
          revenue_share_percent?: number | null
          status?: string
          tier?: string
          updated_at?: string | null
          usage_this_month?: number | null
        }
        Update: {
          api_rate_limit?: number | null
          approved_at?: string | null
          approved_by?: string | null
          company_email?: string
          company_website?: string | null
          contract_end_date?: string | null
          contract_start_date?: string | null
          created_at?: string | null
          id?: string
          metadata?: Json | null
          monthly_quota?: number | null
          organization_id?: string | null
          partner_name?: string
          partner_type?: string
          revenue_share_percent?: number | null
          status?: string
          tier?: string
          updated_at?: string | null
          usage_this_month?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "partner_accounts_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "engagement_metrics"
            referencedColumns: ["organization_id"]
          },
          {
            foreignKeyName: "partner_accounts_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      password_history: {
        Row: {
          created_at: string | null
          id: string
          password_hash: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          password_hash: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          password_hash?: string
          user_id?: string
        }
        Relationships: []
      }
      password_leak_checks: {
        Row: {
          checked_at: string | null
          hash_prefix: string
          id: string
          is_leaked: boolean
          metadata: Json | null
          user_id: string | null
        }
        Insert: {
          checked_at?: string | null
          hash_prefix: string
          id?: string
          is_leaked: boolean
          metadata?: Json | null
          user_id?: string | null
        }
        Update: {
          checked_at?: string | null
          hash_prefix?: string
          id?: string
          is_leaked?: boolean
          metadata?: Json | null
          user_id?: string | null
        }
        Relationships: []
      }
      password_policies: {
        Row: {
          created_at: string | null
          expiry_days: number | null
          id: string
          lockout_duration_minutes: number | null
          max_login_attempts: number | null
          min_length: number | null
          organization_id: string
          password_history_count: number | null
          require_lowercase: boolean | null
          require_numbers: boolean | null
          require_special_chars: boolean | null
          require_uppercase: boolean | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          expiry_days?: number | null
          id?: string
          lockout_duration_minutes?: number | null
          max_login_attempts?: number | null
          min_length?: number | null
          organization_id: string
          password_history_count?: number | null
          require_lowercase?: boolean | null
          require_numbers?: boolean | null
          require_special_chars?: boolean | null
          require_uppercase?: boolean | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          expiry_days?: number | null
          id?: string
          lockout_duration_minutes?: number | null
          max_login_attempts?: number | null
          min_length?: number | null
          organization_id?: string
          password_history_count?: number | null
          require_lowercase?: boolean | null
          require_numbers?: boolean | null
          require_special_chars?: boolean | null
          require_uppercase?: boolean | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "password_policies_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: true
            referencedRelation: "engagement_metrics"
            referencedColumns: ["organization_id"]
          },
          {
            foreignKeyName: "password_policies_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: true
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      plugin_installations: {
        Row: {
          configuration: Json | null
          id: string
          installed_at: string | null
          installed_version: string
          is_active: boolean | null
          last_updated_at: string | null
          organization_id: string
          plugin_id: string
        }
        Insert: {
          configuration?: Json | null
          id?: string
          installed_at?: string | null
          installed_version: string
          is_active?: boolean | null
          last_updated_at?: string | null
          organization_id: string
          plugin_id: string
        }
        Update: {
          configuration?: Json | null
          id?: string
          installed_at?: string | null
          installed_version?: string
          is_active?: boolean | null
          last_updated_at?: string | null
          organization_id?: string
          plugin_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "plugin_installations_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "engagement_metrics"
            referencedColumns: ["organization_id"]
          },
          {
            foreignKeyName: "plugin_installations_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "plugin_installations_plugin_id_fkey"
            columns: ["plugin_id"]
            isOneToOne: false
            referencedRelation: "marketplace_plugins"
            referencedColumns: ["id"]
          },
        ]
      }
      plugin_reviews: {
        Row: {
          created_at: string | null
          helpful_count: number | null
          id: string
          is_verified_purchase: boolean | null
          organization_id: string
          plugin_id: string
          rating: number
          review_text: string | null
          reviewer_id: string
          title: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          helpful_count?: number | null
          id?: string
          is_verified_purchase?: boolean | null
          organization_id: string
          plugin_id: string
          rating: number
          review_text?: string | null
          reviewer_id: string
          title?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          helpful_count?: number | null
          id?: string
          is_verified_purchase?: boolean | null
          organization_id?: string
          plugin_id?: string
          rating?: number
          review_text?: string | null
          reviewer_id?: string
          title?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "plugin_reviews_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "engagement_metrics"
            referencedColumns: ["organization_id"]
          },
          {
            foreignKeyName: "plugin_reviews_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "plugin_reviews_plugin_id_fkey"
            columns: ["plugin_id"]
            isOneToOne: false
            referencedRelation: "marketplace_plugins"
            referencedColumns: ["id"]
          },
        ]
      }
      predictive_compliance_scores: {
        Row: {
          confidence_level: number | null
          id: string
          organization_id: string
          predicted_ai_act_score: number | null
          predicted_at: string | null
          predicted_esg_score: number | null
          predicted_gdpr_score: number | null
          predicted_overall_score: number | null
          prediction_horizon_days: number
          recommendations: Json | null
          risk_factors: Json | null
        }
        Insert: {
          confidence_level?: number | null
          id?: string
          organization_id: string
          predicted_ai_act_score?: number | null
          predicted_at?: string | null
          predicted_esg_score?: number | null
          predicted_gdpr_score?: number | null
          predicted_overall_score?: number | null
          prediction_horizon_days: number
          recommendations?: Json | null
          risk_factors?: Json | null
        }
        Update: {
          confidence_level?: number | null
          id?: string
          organization_id?: string
          predicted_ai_act_score?: number | null
          predicted_at?: string | null
          predicted_esg_score?: number | null
          predicted_gdpr_score?: number | null
          predicted_overall_score?: number | null
          prediction_horizon_days?: number
          recommendations?: Json | null
          risk_factors?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "predictive_compliance_scores_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "engagement_metrics"
            referencedColumns: ["organization_id"]
          },
          {
            foreignKeyName: "predictive_compliance_scores_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          bio: string | null
          created_at: string | null
          currency: string | null
          data_region: string | null
          display_name: string | null
          email: string
          force_password_change: boolean | null
          full_name: string | null
          id: string
          language: string | null
          last_password_change_reminder: string | null
          marketing_consent: boolean | null
          marketing_consent_date: string | null
          mfa_enabled: boolean | null
          mfa_secret: string | null
          mfa_secret_temp: string | null
          onboarding_completed: boolean | null
          onboarding_completed_at: string | null
          organization_id: string
          password_changed_at: string | null
          password_expires_at: string | null
          password_expiry_days: number | null
          preferences: Json | null
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string | null
          currency?: string | null
          data_region?: string | null
          display_name?: string | null
          email: string
          force_password_change?: boolean | null
          full_name?: string | null
          id: string
          language?: string | null
          last_password_change_reminder?: string | null
          marketing_consent?: boolean | null
          marketing_consent_date?: string | null
          mfa_enabled?: boolean | null
          mfa_secret?: string | null
          mfa_secret_temp?: string | null
          onboarding_completed?: boolean | null
          onboarding_completed_at?: string | null
          organization_id: string
          password_changed_at?: string | null
          password_expires_at?: string | null
          password_expiry_days?: number | null
          preferences?: Json | null
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string | null
          currency?: string | null
          data_region?: string | null
          display_name?: string | null
          email?: string
          force_password_change?: boolean | null
          full_name?: string | null
          id?: string
          language?: string | null
          last_password_change_reminder?: string | null
          marketing_consent?: boolean | null
          marketing_consent_date?: string | null
          mfa_enabled?: boolean | null
          mfa_secret?: string | null
          mfa_secret_temp?: string | null
          onboarding_completed?: boolean | null
          onboarding_completed_at?: string | null
          organization_id?: string
          password_changed_at?: string | null
          password_expires_at?: string | null
          password_expiry_days?: number | null
          preferences?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "profiles_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "engagement_metrics"
            referencedColumns: ["organization_id"]
          },
          {
            foreignKeyName: "profiles_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      qa_test_results: {
        Row: {
          actual_output: string | null
          created_at: string | null
          expected_output: string | null
          id: string
          latency_ms: number | null
          message: string | null
          module: string
          output_hash: string | null
          run_id: string | null
          status: string
        }
        Insert: {
          actual_output?: string | null
          created_at?: string | null
          expected_output?: string | null
          id?: string
          latency_ms?: number | null
          message?: string | null
          module: string
          output_hash?: string | null
          run_id?: string | null
          status: string
        }
        Update: {
          actual_output?: string | null
          created_at?: string | null
          expected_output?: string | null
          id?: string
          latency_ms?: number | null
          message?: string | null
          module?: string
          output_hash?: string | null
          run_id?: string | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "qa_test_results_run_id_fkey"
            columns: ["run_id"]
            isOneToOne: false
            referencedRelation: "qa_test_runs"
            referencedColumns: ["id"]
          },
        ]
      }
      qa_test_runs: {
        Row: {
          avg_latency_ms: number | null
          failed: number | null
          finished_at: string | null
          id: string
          notes: string | null
          passed: number | null
          started_at: string | null
          total_tests: number | null
          triggered_by: string | null
        }
        Insert: {
          avg_latency_ms?: number | null
          failed?: number | null
          finished_at?: string | null
          id?: string
          notes?: string | null
          passed?: number | null
          started_at?: string | null
          total_tests?: number | null
          triggered_by?: string | null
        }
        Update: {
          avg_latency_ms?: number | null
          failed?: number | null
          finished_at?: string | null
          id?: string
          notes?: string | null
          passed?: number | null
          started_at?: string | null
          total_tests?: number | null
          triggered_by?: string | null
        }
        Relationships: []
      }
      rag_accuracy_metrics: {
        Row: {
          actual_relevance: number | null
          cosine_similarity: number | null
          embedding_model: string | null
          expected_relevance: number | null
          id: string
          passed: boolean | null
          query_text: string
          tested_at: string | null
        }
        Insert: {
          actual_relevance?: number | null
          cosine_similarity?: number | null
          embedding_model?: string | null
          expected_relevance?: number | null
          id?: string
          passed?: boolean | null
          query_text: string
          tested_at?: string | null
        }
        Update: {
          actual_relevance?: number | null
          cosine_similarity?: number | null
          embedding_model?: string | null
          expected_relevance?: number | null
          id?: string
          passed?: boolean | null
          query_text?: string
          tested_at?: string | null
        }
        Relationships: []
      }
      regsense_sessions: {
        Row: {
          citations: Json | null
          context_scope: string
          created_at: string | null
          embedding_version: string | null
          error_message: string | null
          fallback_used: boolean | null
          id: string
          input_hash: string | null
          model_name: string | null
          organization_id: string
          output_hash: string | null
          query_text: string
          response_text: string | null
          response_time_ms: number | null
          user_id: string | null
        }
        Insert: {
          citations?: Json | null
          context_scope: string
          created_at?: string | null
          embedding_version?: string | null
          error_message?: string | null
          fallback_used?: boolean | null
          id?: string
          input_hash?: string | null
          model_name?: string | null
          organization_id: string
          output_hash?: string | null
          query_text: string
          response_text?: string | null
          response_time_ms?: number | null
          user_id?: string | null
        }
        Update: {
          citations?: Json | null
          context_scope?: string
          created_at?: string | null
          embedding_version?: string | null
          error_message?: string | null
          fallback_used?: boolean | null
          id?: string
          input_hash?: string | null
          model_name?: string | null
          organization_id?: string
          output_hash?: string | null
          query_text?: string
          response_text?: string | null
          response_time_ms?: number | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "regsense_sessions_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "engagement_metrics"
            referencedColumns: ["organization_id"]
          },
          {
            foreignKeyName: "regsense_sessions_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "regsense_sessions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      regulation_sync_logs: {
        Row: {
          checksum: string | null
          chunks_created: number | null
          completed_at: string | null
          error_message: string | null
          id: string
          regulation_type: string
          source_url: string
          started_at: string | null
          status: string | null
        }
        Insert: {
          checksum?: string | null
          chunks_created?: number | null
          completed_at?: string | null
          error_message?: string | null
          id?: string
          regulation_type: string
          source_url: string
          started_at?: string | null
          status?: string | null
        }
        Update: {
          checksum?: string | null
          chunks_created?: number | null
          completed_at?: string | null
          error_message?: string | null
          id?: string
          regulation_type?: string
          source_url?: string
          started_at?: string | null
          status?: string | null
        }
        Relationships: []
      }
      regulation_versions: {
        Row: {
          chunks_count: number | null
          created_at: string | null
          file_path: string
          id: string
          metadata: Json | null
          organization_id: string
          regulation_type: string
          status: string | null
          uploaded_at: string | null
          uploaded_by: string | null
          version: string
        }
        Insert: {
          chunks_count?: number | null
          created_at?: string | null
          file_path: string
          id?: string
          metadata?: Json | null
          organization_id: string
          regulation_type: string
          status?: string | null
          uploaded_at?: string | null
          uploaded_by?: string | null
          version: string
        }
        Update: {
          chunks_count?: number | null
          created_at?: string | null
          file_path?: string
          id?: string
          metadata?: Json | null
          organization_id?: string
          regulation_type?: string
          status?: string | null
          uploaded_at?: string | null
          uploaded_by?: string | null
          version?: string
        }
        Relationships: [
          {
            foreignKeyName: "regulation_versions_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "engagement_metrics"
            referencedColumns: ["organization_id"]
          },
          {
            foreignKeyName: "regulation_versions_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      regulatory_documents: {
        Row: {
          content: string | null
          created_at: string | null
          document_name: string
          document_type: string
          id: string
          is_active: boolean | null
          language: string | null
          metadata: Json | null
          source_url: string | null
          updated_at: string | null
          valid_from: string | null
          valid_until: string | null
          version: string | null
        }
        Insert: {
          content?: string | null
          created_at?: string | null
          document_name: string
          document_type: string
          id?: string
          is_active?: boolean | null
          language?: string | null
          metadata?: Json | null
          source_url?: string | null
          updated_at?: string | null
          valid_from?: string | null
          valid_until?: string | null
          version?: string | null
        }
        Update: {
          content?: string | null
          created_at?: string | null
          document_name?: string
          document_type?: string
          id?: string
          is_active?: boolean | null
          language?: string | null
          metadata?: Json | null
          source_url?: string | null
          updated_at?: string | null
          valid_from?: string | null
          valid_until?: string | null
          version?: string | null
        }
        Relationships: []
      }
      regulatory_requirements: {
        Row: {
          annex_ref: string | null
          article_ref: string | null
          code: string
          created_at: string | null
          description: string | null
          id: string
          metadata: Json | null
          regulation_type: string
          title: string
          updated_at: string | null
          valid_from: string
          valid_until: string | null
          version: string
        }
        Insert: {
          annex_ref?: string | null
          article_ref?: string | null
          code: string
          created_at?: string | null
          description?: string | null
          id?: string
          metadata?: Json | null
          regulation_type: string
          title: string
          updated_at?: string | null
          valid_from?: string
          valid_until?: string | null
          version?: string
        }
        Update: {
          annex_ref?: string | null
          article_ref?: string | null
          code?: string
          created_at?: string | null
          description?: string | null
          id?: string
          metadata?: Json | null
          regulation_type?: string
          title?: string
          updated_at?: string | null
          valid_from?: string
          valid_until?: string | null
          version?: string
        }
        Relationships: []
      }
      reseller_organizations: {
        Row: {
          child_organization_id: string
          created_at: string | null
          custom_branding: Json | null
          custom_domain: string | null
          id: string
          is_active: boolean | null
          parent_organization_id: string
          partner_account_id: string
          revenue_share_config: Json | null
          updated_at: string | null
        }
        Insert: {
          child_organization_id: string
          created_at?: string | null
          custom_branding?: Json | null
          custom_domain?: string | null
          id?: string
          is_active?: boolean | null
          parent_organization_id: string
          partner_account_id: string
          revenue_share_config?: Json | null
          updated_at?: string | null
        }
        Update: {
          child_organization_id?: string
          created_at?: string | null
          custom_branding?: Json | null
          custom_domain?: string | null
          id?: string
          is_active?: boolean | null
          parent_organization_id?: string
          partner_account_id?: string
          revenue_share_config?: Json | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "reseller_organizations_child_organization_id_fkey"
            columns: ["child_organization_id"]
            isOneToOne: false
            referencedRelation: "engagement_metrics"
            referencedColumns: ["organization_id"]
          },
          {
            foreignKeyName: "reseller_organizations_child_organization_id_fkey"
            columns: ["child_organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reseller_organizations_parent_organization_id_fkey"
            columns: ["parent_organization_id"]
            isOneToOne: false
            referencedRelation: "engagement_metrics"
            referencedColumns: ["organization_id"]
          },
          {
            foreignKeyName: "reseller_organizations_parent_organization_id_fkey"
            columns: ["parent_organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reseller_organizations_partner_account_id_fkey"
            columns: ["partner_account_id"]
            isOneToOne: false
            referencedRelation: "partner_accounts"
            referencedColumns: ["id"]
          },
        ]
      }
      retrieval_feedback: {
        Row: {
          clicked_chunk_id: string | null
          created_at: string | null
          id: string
          missing_citation: boolean | null
          module: string
          organization_id: string | null
          query: string
          satisfaction: number | null
          topk_result_ids: string[] | null
          user_id: string | null
        }
        Insert: {
          clicked_chunk_id?: string | null
          created_at?: string | null
          id?: string
          missing_citation?: boolean | null
          module: string
          organization_id?: string | null
          query: string
          satisfaction?: number | null
          topk_result_ids?: string[] | null
          user_id?: string | null
        }
        Update: {
          clicked_chunk_id?: string | null
          created_at?: string | null
          id?: string
          missing_citation?: boolean | null
          module?: string
          organization_id?: string | null
          query?: string
          satisfaction?: number | null
          topk_result_ids?: string[] | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "retrieval_feedback_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "engagement_metrics"
            referencedColumns: ["organization_id"]
          },
          {
            foreignKeyName: "retrieval_feedback_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "retrieval_feedback_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      rls_validation_logs: {
        Row: {
          id: string
          issues_found: string[] | null
          policy_count: number | null
          rls_enabled: boolean
          table_name: string
          validated_at: string | null
        }
        Insert: {
          id?: string
          issues_found?: string[] | null
          policy_count?: number | null
          rls_enabled: boolean
          table_name: string
          validated_at?: string | null
        }
        Update: {
          id?: string
          issues_found?: string[] | null
          policy_count?: number | null
          rls_enabled?: boolean
          table_name?: string
          validated_at?: string | null
        }
        Relationships: []
      }
      scheduled_jobs: {
        Row: {
          config: Json | null
          created_at: string | null
          enabled: boolean | null
          id: string
          job_name: string
          job_type: string
          last_run_at: string | null
          last_status: string | null
          next_run_at: string | null
          organization_id: string | null
          schedule_cron: string
          updated_at: string | null
        }
        Insert: {
          config?: Json | null
          created_at?: string | null
          enabled?: boolean | null
          id?: string
          job_name: string
          job_type: string
          last_run_at?: string | null
          last_status?: string | null
          next_run_at?: string | null
          organization_id?: string | null
          schedule_cron: string
          updated_at?: string | null
        }
        Update: {
          config?: Json | null
          created_at?: string | null
          enabled?: boolean | null
          id?: string
          job_name?: string
          job_type?: string
          last_run_at?: string | null
          last_status?: string | null
          next_run_at?: string | null
          organization_id?: string | null
          schedule_cron?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "scheduled_jobs_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "engagement_metrics"
            referencedColumns: ["organization_id"]
          },
          {
            foreignKeyName: "scheduled_jobs_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      security_alert_notifications: {
        Row: {
          acknowledged: boolean | null
          acknowledged_at: string | null
          acknowledged_by: string | null
          alert_type: string
          created_at: string | null
          event_data: Json | null
          id: string
          message: string
          metric_value: number | null
          organization_id: string | null
          policy_id: string | null
          sent_channels: string[] | null
          severity: string
          threshold_value: number | null
        }
        Insert: {
          acknowledged?: boolean | null
          acknowledged_at?: string | null
          acknowledged_by?: string | null
          alert_type: string
          created_at?: string | null
          event_data?: Json | null
          id?: string
          message: string
          metric_value?: number | null
          organization_id?: string | null
          policy_id?: string | null
          sent_channels?: string[] | null
          severity: string
          threshold_value?: number | null
        }
        Update: {
          acknowledged?: boolean | null
          acknowledged_at?: string | null
          acknowledged_by?: string | null
          alert_type?: string
          created_at?: string | null
          event_data?: Json | null
          id?: string
          message?: string
          metric_value?: number | null
          organization_id?: string | null
          policy_id?: string | null
          sent_channels?: string[] | null
          severity?: string
          threshold_value?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "security_alert_notifications_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "engagement_metrics"
            referencedColumns: ["organization_id"]
          },
          {
            foreignKeyName: "security_alert_notifications_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "security_alert_notifications_policy_id_fkey"
            columns: ["policy_id"]
            isOneToOne: false
            referencedRelation: "alert_policies"
            referencedColumns: ["id"]
          },
        ]
      }
      security_audit_logs: {
        Row: {
          audit_type: string
          auto_fixed: boolean | null
          created_at: string | null
          finding: string
          id: string
          remediation_status: string | null
          resolved_at: string | null
          severity: string
        }
        Insert: {
          audit_type: string
          auto_fixed?: boolean | null
          created_at?: string | null
          finding: string
          id?: string
          remediation_status?: string | null
          resolved_at?: string | null
          severity: string
        }
        Update: {
          audit_type?: string
          auto_fixed?: boolean | null
          created_at?: string | null
          finding?: string
          id?: string
          remediation_status?: string | null
          resolved_at?: string | null
          severity?: string
        }
        Relationships: []
      }
      security_events: {
        Row: {
          created_at: string | null
          event_details: Json
          event_type: string
          id: string
          ip_address: unknown
          organization_id: string | null
          resolved: boolean | null
          resolved_at: string | null
          resolved_by: string | null
          severity: string
          threat_indicators: string[] | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          event_details?: Json
          event_type: string
          id?: string
          ip_address?: unknown
          organization_id?: string | null
          resolved?: boolean | null
          resolved_at?: string | null
          resolved_by?: string | null
          severity: string
          threat_indicators?: string[] | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          event_details?: Json
          event_type?: string
          id?: string
          ip_address?: unknown
          organization_id?: string | null
          resolved?: boolean | null
          resolved_at?: string | null
          resolved_by?: string | null
          severity?: string
          threat_indicators?: string[] | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "security_events_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "engagement_metrics"
            referencedColumns: ["organization_id"]
          },
          {
            foreignKeyName: "security_events_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      security_scan_history: {
        Row: {
          completed_at: string | null
          critical_count: number | null
          dependencies_scanned: number | null
          high_count: number | null
          id: string
          low_count: number | null
          medium_count: number | null
          organization_id: string
          scan_metadata: Json | null
          scan_type: string
          started_at: string | null
          status: string
          vulnerabilities_found: number | null
        }
        Insert: {
          completed_at?: string | null
          critical_count?: number | null
          dependencies_scanned?: number | null
          high_count?: number | null
          id?: string
          low_count?: number | null
          medium_count?: number | null
          organization_id: string
          scan_metadata?: Json | null
          scan_type: string
          started_at?: string | null
          status?: string
          vulnerabilities_found?: number | null
        }
        Update: {
          completed_at?: string | null
          critical_count?: number | null
          dependencies_scanned?: number | null
          high_count?: number | null
          id?: string
          low_count?: number | null
          medium_count?: number | null
          organization_id?: string
          scan_metadata?: Json | null
          scan_type?: string
          started_at?: string | null
          status?: string
          vulnerabilities_found?: number | null
        }
        Relationships: []
      }
      security_scan_results: {
        Row: {
          affected_component: string | null
          cve_id: string | null
          detected_at: string | null
          finding_description: string | null
          finding_title: string
          id: string
          organization_id: string
          remediation_steps: string | null
          resolved_at: string | null
          resolved_by: string | null
          scan_metadata: Json | null
          scan_type: string
          severity: string
          status: string | null
        }
        Insert: {
          affected_component?: string | null
          cve_id?: string | null
          detected_at?: string | null
          finding_description?: string | null
          finding_title: string
          id?: string
          organization_id: string
          remediation_steps?: string | null
          resolved_at?: string | null
          resolved_by?: string | null
          scan_metadata?: Json | null
          scan_type: string
          severity: string
          status?: string | null
        }
        Update: {
          affected_component?: string | null
          cve_id?: string | null
          detected_at?: string | null
          finding_description?: string | null
          finding_title?: string
          id?: string
          organization_id?: string
          remediation_steps?: string | null
          resolved_at?: string | null
          resolved_by?: string | null
          scan_metadata?: Json | null
          scan_type?: string
          severity?: string
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "security_scan_results_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "engagement_metrics"
            referencedColumns: ["organization_id"]
          },
          {
            foreignKeyName: "security_scan_results_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      seeding_progress: {
        Row: {
          created_at: string | null
          current_step: string | null
          id: string
          processed_chunks: number | null
          progress_percentage: number | null
          session_id: string
          status: string
          total_chunks: number | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          current_step?: string | null
          id?: string
          processed_chunks?: number | null
          progress_percentage?: number | null
          session_id: string
          status: string
          total_chunks?: number | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          current_step?: string | null
          id?: string
          processed_chunks?: number | null
          progress_percentage?: number | null
          session_id?: string
          status?: string
          total_chunks?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      soc2_evidence_snapshots: {
        Row: {
          access_logs_summary: Json
          audit_chain_status: Json
          created_at: string | null
          evidence_type: string
          hash_signature: string
          id: string
          metrics_summary: Json
          organization_id: string | null
          security_events_summary: Json
          snapshot_date: string
          storage_path: string | null
          trust_principle: string
        }
        Insert: {
          access_logs_summary: Json
          audit_chain_status: Json
          created_at?: string | null
          evidence_type: string
          hash_signature: string
          id?: string
          metrics_summary: Json
          organization_id?: string | null
          security_events_summary: Json
          snapshot_date: string
          storage_path?: string | null
          trust_principle: string
        }
        Update: {
          access_logs_summary?: Json
          audit_chain_status?: Json
          created_at?: string | null
          evidence_type?: string
          hash_signature?: string
          id?: string
          metrics_summary?: Json
          organization_id?: string | null
          security_events_summary?: Json
          snapshot_date?: string
          storage_path?: string | null
          trust_principle?: string
        }
        Relationships: [
          {
            foreignKeyName: "soc2_evidence_snapshots_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "engagement_metrics"
            referencedColumns: ["organization_id"]
          },
          {
            foreignKeyName: "soc2_evidence_snapshots_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      social_sentiment_data: {
        Row: {
          ai_summary: string | null
          analyzed_at: string | null
          career_opportunities_rating: number | null
          company_name: string
          company_url: string | null
          compensation_benefits_rating: number | null
          created_at: string | null
          culture_values_rating: number | null
          data_freshness: string | null
          diversity_inclusion_rating: number | null
          esg_indicators: Json | null
          id: string
          negative_themes: Json | null
          organization_id: string
          overall_rating: number | null
          positive_themes: Json | null
          raw_data: Json | null
          recommendations: string | null
          sample_reviews: Json | null
          senior_management_rating: number | null
          sentiment_score: number | null
          source: string
          total_reviews: number | null
          updated_at: string | null
          work_life_balance_rating: number | null
        }
        Insert: {
          ai_summary?: string | null
          analyzed_at?: string | null
          career_opportunities_rating?: number | null
          company_name: string
          company_url?: string | null
          compensation_benefits_rating?: number | null
          created_at?: string | null
          culture_values_rating?: number | null
          data_freshness?: string | null
          diversity_inclusion_rating?: number | null
          esg_indicators?: Json | null
          id?: string
          negative_themes?: Json | null
          organization_id: string
          overall_rating?: number | null
          positive_themes?: Json | null
          raw_data?: Json | null
          recommendations?: string | null
          sample_reviews?: Json | null
          senior_management_rating?: number | null
          sentiment_score?: number | null
          source: string
          total_reviews?: number | null
          updated_at?: string | null
          work_life_balance_rating?: number | null
        }
        Update: {
          ai_summary?: string | null
          analyzed_at?: string | null
          career_opportunities_rating?: number | null
          company_name?: string
          company_url?: string | null
          compensation_benefits_rating?: number | null
          created_at?: string | null
          culture_values_rating?: number | null
          data_freshness?: string | null
          diversity_inclusion_rating?: number | null
          esg_indicators?: Json | null
          id?: string
          negative_themes?: Json | null
          organization_id?: string
          overall_rating?: number | null
          positive_themes?: Json | null
          raw_data?: Json | null
          recommendations?: string | null
          sample_reviews?: Json | null
          senior_management_rating?: number | null
          sentiment_score?: number | null
          source?: string
          total_reviews?: number | null
          updated_at?: string | null
          work_life_balance_rating?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "social_sentiment_data_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "engagement_metrics"
            referencedColumns: ["organization_id"]
          },
          {
            foreignKeyName: "social_sentiment_data_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      source_schema_cache: {
        Row: {
          captured_at: string | null
          column_name: string
          connector_id: string
          data_type: string | null
          fk_target_column: string | null
          fk_target_table: string | null
          id: string
          is_foreign_key: boolean | null
          is_primary_key: boolean | null
          sample_preview: Json | null
          sampled: boolean | null
          table_name: string
        }
        Insert: {
          captured_at?: string | null
          column_name: string
          connector_id: string
          data_type?: string | null
          fk_target_column?: string | null
          fk_target_table?: string | null
          id?: string
          is_foreign_key?: boolean | null
          is_primary_key?: boolean | null
          sample_preview?: Json | null
          sampled?: boolean | null
          table_name: string
        }
        Update: {
          captured_at?: string | null
          column_name?: string
          connector_id?: string
          data_type?: string | null
          fk_target_column?: string | null
          fk_target_table?: string | null
          id?: string
          is_foreign_key?: boolean | null
          is_primary_key?: boolean | null
          sample_preview?: Json | null
          sampled?: boolean | null
          table_name?: string
        }
        Relationships: []
      }
      sso_connections: {
        Row: {
          auto_provision: boolean | null
          client_id: string | null
          config: Json | null
          created_at: string | null
          default_role: Database["public"]["Enums"]["app_role"] | null
          enabled: boolean | null
          id: string
          organization_id: string
          provider: string
          tenant_id: string | null
          updated_at: string | null
        }
        Insert: {
          auto_provision?: boolean | null
          client_id?: string | null
          config?: Json | null
          created_at?: string | null
          default_role?: Database["public"]["Enums"]["app_role"] | null
          enabled?: boolean | null
          id?: string
          organization_id: string
          provider?: string
          tenant_id?: string | null
          updated_at?: string | null
        }
        Update: {
          auto_provision?: boolean | null
          client_id?: string | null
          config?: Json | null
          created_at?: string | null
          default_role?: Database["public"]["Enums"]["app_role"] | null
          enabled?: boolean | null
          id?: string
          organization_id?: string
          provider?: string
          tenant_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "sso_connections_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: true
            referencedRelation: "engagement_metrics"
            referencedColumns: ["organization_id"]
          },
          {
            foreignKeyName: "sso_connections_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: true
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      stability_reports: {
        Row: {
          auto_fixes_applied: number | null
          generated_at: string | null
          id: string
          issues_found: number | null
          metrics: Json
          report_type: string
          status: string
        }
        Insert: {
          auto_fixes_applied?: number | null
          generated_at?: string | null
          id?: string
          issues_found?: number | null
          metrics?: Json
          report_type: string
          status: string
        }
        Update: {
          auto_fixes_applied?: number | null
          generated_at?: string | null
          id?: string
          issues_found?: number | null
          metrics?: Json
          report_type?: string
          status?: string
        }
        Relationships: []
      }
      staging_rows: {
        Row: {
          arrived_at: string | null
          connector_id: string
          id: number
          payload: Json
          period: string | null
          source_hash: string
          source_table: string
        }
        Insert: {
          arrived_at?: string | null
          connector_id: string
          id?: number
          payload: Json
          period?: string | null
          source_hash: string
          source_table: string
        }
        Update: {
          arrived_at?: string | null
          connector_id?: string
          id?: number
          payload?: Json
          period?: string | null
          source_hash?: string
          source_table?: string
        }
        Relationships: []
      }
      stripe_usage_events: {
        Row: {
          cost_usd: number
          created_at: string | null
          id: string
          organization_id: string
          reported_at: string | null
          stripe_event_id: string | null
          subscription_item_id: string
          tokens_consumed: number
        }
        Insert: {
          cost_usd: number
          created_at?: string | null
          id?: string
          organization_id: string
          reported_at?: string | null
          stripe_event_id?: string | null
          subscription_item_id: string
          tokens_consumed: number
        }
        Update: {
          cost_usd?: number
          created_at?: string | null
          id?: string
          organization_id?: string
          reported_at?: string | null
          stripe_event_id?: string | null
          subscription_item_id?: string
          tokens_consumed?: number
        }
        Relationships: []
      }
      subscriptions: {
        Row: {
          created_at: string | null
          id: string
          monthly_token_limit: number | null
          organization_id: string
          plan: string
          renewal_date: string | null
          status: string
          trial_end: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          monthly_token_limit?: number | null
          organization_id: string
          plan?: string
          renewal_date?: string | null
          status?: string
          trial_end?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          monthly_token_limit?: number | null
          organization_id?: string
          plan?: string
          renewal_date?: string | null
          status?: string
          trial_end?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "subscriptions_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: true
            referencedRelation: "engagement_metrics"
            referencedColumns: ["organization_id"]
          },
          {
            foreignKeyName: "subscriptions_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: true
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      support_tickets: {
        Row: {
          assigned_to: string | null
          category: string | null
          created_at: string | null
          description: string
          id: string
          organization_id: string | null
          priority: string | null
          resolution_notes: string | null
          resolved_at: string | null
          status: string | null
          subject: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          assigned_to?: string | null
          category?: string | null
          created_at?: string | null
          description: string
          id?: string
          organization_id?: string | null
          priority?: string | null
          resolution_notes?: string | null
          resolved_at?: string | null
          status?: string | null
          subject: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          assigned_to?: string | null
          category?: string | null
          created_at?: string | null
          description?: string
          id?: string
          organization_id?: string | null
          priority?: string | null
          resolution_notes?: string | null
          resolved_at?: string | null
          status?: string | null
          subject?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "support_tickets_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "engagement_metrics"
            referencedColumns: ["organization_id"]
          },
          {
            foreignKeyName: "support_tickets_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      system_health_checks: {
        Row: {
          check_type: string
          checked_at: string | null
          component: string
          error_message: string | null
          id: string
          latency_ms: number | null
          metadata: Json | null
          status: string
        }
        Insert: {
          check_type: string
          checked_at?: string | null
          component: string
          error_message?: string | null
          id?: string
          latency_ms?: number | null
          metadata?: Json | null
          status: string
        }
        Update: {
          check_type?: string
          checked_at?: string | null
          component?: string
          error_message?: string | null
          id?: string
          latency_ms?: number | null
          metadata?: Json | null
          status?: string
        }
        Relationships: []
      }
      system_metrics: {
        Row: {
          active_users: number | null
          api_latency_ms: number | null
          cpu_usage: number | null
          created_at: string | null
          error_rate: number | null
          id: string
          memory_usage: number | null
          metadata: Json | null
          organization_id: string | null
          storage_utilization_gb: number | null
          timestamp: string
        }
        Insert: {
          active_users?: number | null
          api_latency_ms?: number | null
          cpu_usage?: number | null
          created_at?: string | null
          error_rate?: number | null
          id?: string
          memory_usage?: number | null
          metadata?: Json | null
          organization_id?: string | null
          storage_utilization_gb?: number | null
          timestamp?: string
        }
        Update: {
          active_users?: number | null
          api_latency_ms?: number | null
          cpu_usage?: number | null
          created_at?: string | null
          error_rate?: number | null
          id?: string
          memory_usage?: number | null
          metadata?: Json | null
          organization_id?: string | null
          storage_utilization_gb?: number | null
          timestamp?: string
        }
        Relationships: [
          {
            foreignKeyName: "system_metrics_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "engagement_metrics"
            referencedColumns: ["organization_id"]
          },
          {
            foreignKeyName: "system_metrics_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      system_prompts: {
        Row: {
          content: string
          created_at: string | null
          id: string
          is_active: boolean | null
          last_modified: string | null
          modified_by: string | null
          module: string
          role: string
          version: number | null
        }
        Insert: {
          content: string
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          last_modified?: string | null
          modified_by?: string | null
          module: string
          role?: string
          version?: number | null
        }
        Update: {
          content?: string
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          last_modified?: string | null
          modified_by?: string | null
          module?: string
          role?: string
          version?: number | null
        }
        Relationships: []
      }
      task_comments: {
        Row: {
          comment: string
          created_at: string | null
          id: string
          task_id: string
          user_id: string
        }
        Insert: {
          comment: string
          created_at?: string | null
          id?: string
          task_id: string
          user_id: string
        }
        Update: {
          comment?: string
          created_at?: string | null
          id?: string
          task_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "task_comments_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "assessment_tasks"
            referencedColumns: ["id"]
          },
        ]
      }
      upload_policies: {
        Row: {
          ai_act_enabled: boolean | null
          allow_embeddings: boolean | null
          allowed_types: string[] | null
          created_at: string | null
          esg_enabled: boolean | null
          gdpr_enabled: boolean | null
          id: string
          max_file_size_mb: number | null
          organization_id: string
          retention_days: number | null
          updated_at: string | null
          updated_by: string | null
        }
        Insert: {
          ai_act_enabled?: boolean | null
          allow_embeddings?: boolean | null
          allowed_types?: string[] | null
          created_at?: string | null
          esg_enabled?: boolean | null
          gdpr_enabled?: boolean | null
          id?: string
          max_file_size_mb?: number | null
          organization_id: string
          retention_days?: number | null
          updated_at?: string | null
          updated_by?: string | null
        }
        Update: {
          ai_act_enabled?: boolean | null
          allow_embeddings?: boolean | null
          allowed_types?: string[] | null
          created_at?: string | null
          esg_enabled?: boolean | null
          gdpr_enabled?: boolean | null
          id?: string
          max_file_size_mb?: number | null
          organization_id?: string
          retention_days?: number | null
          updated_at?: string | null
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "upload_policies_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: true
            referencedRelation: "engagement_metrics"
            referencedColumns: ["organization_id"]
          },
          {
            foreignKeyName: "upload_policies_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: true
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "upload_policies_updated_by_fkey"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      uploaded_documents: {
        Row: {
          analyzed_at: string | null
          created_at: string | null
          doc_type: string
          extracted_data: Json | null
          extracted_summary: string | null
          file_name: string
          file_path: string
          file_size_bytes: number | null
          id: string
          organization_id: string
          status: string | null
          user_id: string | null
        }
        Insert: {
          analyzed_at?: string | null
          created_at?: string | null
          doc_type: string
          extracted_data?: Json | null
          extracted_summary?: string | null
          file_name: string
          file_path: string
          file_size_bytes?: number | null
          id?: string
          organization_id: string
          status?: string | null
          user_id?: string | null
        }
        Update: {
          analyzed_at?: string | null
          created_at?: string | null
          doc_type?: string
          extracted_data?: Json | null
          extracted_summary?: string | null
          file_name?: string
          file_path?: string
          file_size_bytes?: number | null
          id?: string
          organization_id?: string
          status?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "uploaded_documents_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "engagement_metrics"
            referencedColumns: ["organization_id"]
          },
          {
            foreignKeyName: "uploaded_documents_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "uploaded_documents_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      verification_metrics: {
        Row: {
          details: Json | null
          id: string
          measured_at: string | null
          metric_category: string
          metric_name: string
          metric_value: number
          status: string
          target_value: number
          unit: string | null
        }
        Insert: {
          details?: Json | null
          id?: string
          measured_at?: string | null
          metric_category: string
          metric_name: string
          metric_value: number
          status: string
          target_value: number
          unit?: string | null
        }
        Update: {
          details?: Json | null
          id?: string
          measured_at?: string | null
          metric_category?: string
          metric_name?: string
          metric_value?: number
          status?: string
          target_value?: number
          unit?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      engagement_metrics: {
        Row: {
          checklist_items_completed: number | null
          completion_percentage: number | null
          connectors_added: number | null
          copilot_runs: number | null
          files_uploaded: number | null
          last_active_at: string | null
          onboarding_completed: boolean | null
          onboarding_completed_at: string | null
          organization_id: string | null
          organization_name: string | null
          plan: string | null
          reports_generated: number | null
          signup_date: string | null
        }
        Relationships: []
      }
      regsense_analytics: {
        Row: {
          avg_response_time_ms: number | null
          context_scope: string | null
          error_count: number | null
          fallback_count: number | null
          organization_id: string | null
          query_count: number | null
          query_date: string | null
          unique_users: number | null
        }
        Relationships: [
          {
            foreignKeyName: "regsense_sessions_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "engagement_metrics"
            referencedColumns: ["organization_id"]
          },
          {
            foreignKeyName: "regsense_sessions_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Functions: {
      accept_organization_invite: {
        Args: { p_invite_token: string; p_user_id: string }
        Returns: Json
      }
      check_token_quota: {
        Args: { org_id: string; requested_tokens: number }
        Returns: Json
      }
      find_org_by_email_domain: { Args: { p_email: string }; Returns: string }
      gdpr_delete_user_data: {
        Args: { subject_email: string }
        Returns: undefined
      }
      generate_api_key: {
        Args: {
          p_environment?: string
          p_key_name: string
          p_partner_account_id: string
          p_scopes: string[]
        }
        Returns: Json
      }
      generate_conformity_hash: {
        Args: { p_report_id: string }
        Returns: string
      }
      get_byok_config: { Args: { org_id: string }; Returns: Json }
      get_chunk_feedback_scores: {
        Args: { p_chunk_id?: string; p_organization_id?: string }
        Returns: {
          chunk_id: string
          downvotes: number
          last_feedback_at: string
          net_score: number
          unique_raters: number
          upvotes: number
        }[]
      }
      get_daily_token_usage: {
        Args: { org_id: string; target_date?: string }
        Returns: {
          request_count: number
          total_cost: number
          total_tokens: number
        }[]
      }
      get_user_organization_id: { Args: { _user_id: string }; Returns: string }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      increment_token_usage: {
        Args: { org_id: string; tokens_consumed: number }
        Returns: undefined
      }
      initialize_onboarding_checklist: {
        Args: { org_id: string }
        Returns: undefined
      }
      is_account_locked: { Args: { user_email: string }; Returns: Json }
      is_password_expired: { Args: { user_id: string }; Returns: boolean }
      log_marketing_event: {
        Args: {
          p_event_type: string
          p_metadata?: Json
          p_org_id: string
          p_user_id: string
        }
        Returns: string
      }
      match_regulatory_chunks: {
        Args: {
          match_count?: number
          match_threshold?: number
          query_embedding: string
        }
        Returns: {
          content: string
          id: string
          section: string
          similarity: number
          source: string
        }[]
      }
      purge_old_audit_logs: { Args: never; Returns: undefined }
      refresh_chunk_feedback_scores: { Args: never; Returns: undefined }
      validate_api_key: { Args: { p_api_key: string }; Returns: Json }
    }
    Enums: {
      agent_task_status:
        | "pending"
        | "in_progress"
        | "completed"
        | "failed"
        | "cancelled"
      agent_task_type:
        | "ai_act_audit"
        | "gdpr_scan"
        | "esg_analysis"
        | "nis2_assessment"
        | "dora_assessment"
        | "dma_assessment"
      app_role: "admin" | "analyst" | "auditor" | "viewer"
      connector_status: "active" | "inactive" | "error" | "configuring"
      connector_type:
        | "sap"
        | "sharepoint"
        | "onedrive"
        | "aws_s3"
        | "azure_blob"
        | "jira"
        | "slack"
        | "teams"
        | "linkedin"
        | "glassdoor"
        | "rss_feed"
      sync_frequency: "realtime" | "hourly" | "daily" | "weekly" | "manual"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      agent_task_status: [
        "pending",
        "in_progress",
        "completed",
        "failed",
        "cancelled",
      ],
      agent_task_type: [
        "ai_act_audit",
        "gdpr_scan",
        "esg_analysis",
        "nis2_assessment",
        "dora_assessment",
        "dma_assessment",
      ],
      app_role: ["admin", "analyst", "auditor", "viewer"],
      connector_status: ["active", "inactive", "error", "configuring"],
      connector_type: [
        "sap",
        "sharepoint",
        "onedrive",
        "aws_s3",
        "azure_blob",
        "jira",
        "slack",
        "teams",
        "linkedin",
        "glassdoor",
        "rss_feed",
      ],
      sync_frequency: ["realtime", "hourly", "daily", "weekly", "manual"],
    },
  },
} as const
