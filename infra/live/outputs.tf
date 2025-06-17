output "region" {
  description = "AWS region"
  value       = var.region
}

output "cluster_name" {
  description = "Kubernetes Cluster Name"
  value       = module.eks.cluster_name
}

output "cluster_endpoint" {
  description = "Endpoint for EKS control plane"
  value       = module.eks.cluster_endpoint
}

output "cluster_security_group_id" {
  description = "Security group ids attached to the cluster control plane"
  value       = module.eks.cluster_security_group_id
}

output "s3_bucket_name" {
  description = "S3 bucket name"
  value       = aws_s3_bucket.s3_storage.bucket
}

/*
output "rds_cluster_name" {
  description = "RDS cluster name"
  value       = aws_rds_cluster.rds_cluster.cluster_identifier
}
*/
