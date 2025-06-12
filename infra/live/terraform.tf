terraform {

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.47.0"
    }

    random = {
      source  = "hashicorp/random"
      version = "~> 3.6.1"
    }

    kubernetes = {
      source  = "hashicorp/kubernetes"
      version = ">= 2.16.1"
    }

    helm = {
      source  = "hashicorp/helm"
      version = "~> 2.13.2"
    }
  }

  required_version = "~> 1.3"
}

provider "aws" {
  region  = var.region
  profile = var.profile
}

provider "random" {}
resource "random_pet" "name" {}

data "aws_eks_cluster" "cluster" {
  name = module.eks.cluster_name
}

data "aws_eks_cluster_auth" "cluster_token" {
  name = module.eks.cluster_name
}

provider "kubernetes" {
  host                   = data.aws_eks_cluster.cluster.endpoint
  cluster_ca_certificate = base64decode(data.aws_eks_cluster.cluster.certificate_authority.0.data)
  exec {
    api_version = "client.authentication.k8s.io/v1beta1"
    command     = "aws"
    args = [
      "eks",
      "get-token",
      "--cluster-name",
      data.aws_eks_cluster.cluster.name
    ]
  }
}

provider "helm" {
  kubernetes {
    host                   = data.aws_eks_cluster.cluster.endpoint
    cluster_ca_certificate = base64decode(data.aws_eks_cluster.cluster.certificate_authority.0.data)
    token                  = data.aws_eks_cluster_auth.cluster_token.token
  }
}
