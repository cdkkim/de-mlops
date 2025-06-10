output "region" {
  description = "AWS region"
  value       = var.region
}

output "instance_id" {
  description = "Instance ID"
  value       = aws_instance.dev_instance.id
}

output "instance_public_ip" {
  description = "Instance public IP"
  value       = aws_instance.dev_instance.public_ip
}
