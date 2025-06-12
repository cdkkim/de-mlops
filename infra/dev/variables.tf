variable "region" {
  description = "AWS region"
  type        = string
  default     = "ap-northeast-2"
}

variable "profile" {
  description = "AWS SSO profile"
  type        = string
  default     = "middlek"
}

variable "key_name" {
  description = "AWS key name"
  type        = string
  default     = "jungkim"
}
