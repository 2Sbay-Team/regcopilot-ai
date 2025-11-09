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
            referencedRelation: "organizations"
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
            referencedRelation: "organizations"
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
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
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
            referencedRelation: "organizations"
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
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
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
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
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
            referencedRelation: "organizations"
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
            referencedRelation: "organizations"
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
          country_code: string | null
          created_at: string | null
          id: string
          llm_token_quota: number
          name: string
          plan: string | null
          quota_reset_date: string | null
          tokens_used_this_month: number
        }
        Insert: {
          billing_model?: string
          byok_api_key_encrypted?: string | null
          byok_model?: string | null
          byok_provider?: string | null
          country_code?: string | null
          created_at?: string | null
          id?: string
          llm_token_quota?: number
          name: string
          plan?: string | null
          quota_reset_date?: string | null
          tokens_used_this_month?: number
        }
        Update: {
          billing_model?: string
          byok_api_key_encrypted?: string | null
          byok_model?: string | null
          byok_provider?: string | null
          country_code?: string | null
          created_at?: string | null
          id?: string
          llm_token_quota?: number
          name?: string
          plan?: string | null
          quota_reset_date?: string | null
          tokens_used_this_month?: number
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
      profiles: {
        Row: {
          created_at: string | null
          currency: string | null
          email: string
          full_name: string | null
          id: string
          language: string | null
          mfa_enabled: boolean | null
          mfa_secret: string | null
          mfa_secret_temp: string | null
          organization_id: string
        }
        Insert: {
          created_at?: string | null
          currency?: string | null
          email: string
          full_name?: string | null
          id: string
          language?: string | null
          mfa_enabled?: boolean | null
          mfa_secret?: string | null
          mfa_secret_temp?: string | null
          organization_id: string
        }
        Update: {
          created_at?: string | null
          currency?: string | null
          email?: string
          full_name?: string | null
          id?: string
          language?: string | null
          mfa_enabled?: boolean | null
          mfa_secret?: string | null
          mfa_secret_temp?: string | null
          organization_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "profiles_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
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
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
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
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      check_token_quota: {
        Args: { org_id: string; requested_tokens: number }
        Returns: Json
      }
      gdpr_delete_user_data: {
        Args: { subject_email: string }
        Returns: undefined
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
