-- Enable realtime for model_usage_logs table
ALTER TABLE model_usage_logs REPLICA IDENTITY FULL;

-- Add to realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE model_usage_logs;