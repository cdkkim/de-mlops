variable "region" {
  description = "AWS region"
  type        = string
  default     = "ap-northeast-2"
}

variable "profile" {
  description = "AWS SSO profile"
  type        = string
  default     = "middlek-eks"
}

variable "sso_admin_role_arn" {
  description = "SSO admin role ARN"
  type        = string
  default     = "arn:aws:iam::456330605094:role/AWSReservedSSO_AdministratorAccessEKSAdmin_55ddd04e054845b8"
}

variable "sso_developer_role_arn" {
  description = "SSO developer role ARN"
  type        = string
  default     = "arn:aws:iam::456330605094:role/AWSReservedSSO_AdministratorAccess_55ddd04e054845b8"
}

variable "argocd_git_repo_url" {
  description = "ArgoCD git repository URL"
  type        = string
  default     = "https://github.com/cdkkim/de-mlops.git"
}

variable "argocd_git_branch" {
  description = "ArgoCD git branch"
  type        = string
  default     = "cd-manifest"
}

variable "argocd_git_path" {
  description = "ArgoCD git path"
  type        = string
  default     = "cd/kustomize/overlays"
}
