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
          country_code: string | null
          created_at: string | null
          id: string
          name: string
          plan: string | null
        }
        Insert: {
          country_code?: string | null
          created_at?: string | null
          id?: string
          name: string
          plan?: string | null
        }
        Update: {
          country_code?: string | null
          created_at?: string | null
          id?: string
          name?: string
          plan?: string | null
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
          organization_id: string
        }
        Insert: {
          created_at?: string | null
          currency?: string | null
          email: string
          full_name?: string | null
          id: string
          language?: string | null
          organization_id: string
        }
        Update: {
          created_at?: string | null
          currency?: string | null
          email?: string
          full_name?: string | null
          id?: string
          language?: string | null
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
    }
    Enums: {
      app_role: "admin" | "analyst" | "auditor" | "viewer"
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
      app_role: ["admin", "analyst", "auditor", "viewer"],
    },
  },
} as const
