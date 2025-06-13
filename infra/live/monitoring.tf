resource "aws_s3_bucket" "loki_s3_storage" {
  bucket = "live-loki-s3"

  tags = {
    Name = "live-loki-s3"
  }
}

resource "kubernetes_namespace" "monitoring" {
  metadata {
    name = "monitoring"
  }
}

resource "kubernetes_service_account" "loki_s3_sa" {
  metadata {
    name      = "loki-s3-sa"
    namespace = "monitoring"
    annotations = {
      "eks.amazonaws.com/role-arn" = module.loki_irsa.iam_role_arn
    }
  }
}

module "loki_irsa" {
  source  = "terraform-aws-modules/iam/aws//modules/iam-assumable-role-with-oidc"
  version = "5.39.0"

  create_role      = true
  role_name        = "loki-irsa-role"
  provider_url     = module.eks.oidc_provider
  role_policy_arns = [aws_iam_policy.live_s3_rw_policy.arn]
  oidc_fully_qualified_subjects = [
    "system:serviceaccount:monitoring:loki-s3-sa",
  ]
}

resource "helm_release" "loki_stack" {
  name       = "loki-stack"
  repository = "https://grafana.github.io/helm-charts"
  chart      = "loki-stack"
  namespace  = "monitoring"

  values = [
    file("config/loki_stack_values.yaml")
  ]

  set {
    name  = "loki.config.storage_config.aws.s3"
    value = aws_s3_bucket.loki_s3_storage.bucket
  }

  set {
    name  = "loki.config.storage_config.aws.region"
    value = var.region
  }

  set {
    name  = "loki.serviceAccount.create"
    value = "false"
  }

  set {
    name  = "loki.serviceAccount.name"
    value = kubernetes_service_account.loki_s3_sa.metadata[0].name
  }

  set {
    name  = "grafana.plugins[0]"
    value = "grafana-amazonprometheus-datasource"
  }
}

resource "helm_release" "prometheus_stack" {
  name       = "prometheus-stack"
  repository = "https://prometheus-community.github.io/helm-charts"
  chart      = "kube-prometheus-stack"
  namespace  = "monitoring"

  set {
    name  = "grafana.enabled"
    value = "false"
  }

  set {
    name  = "prometheus.serviceAccount.create"
    value = "false"
  }

  set {
    name  = "prometheus.serviceAccount.name"
    value = kubernetes_service_account.amp_sa.metadata[0].name
  }

  set {
    name  = "prometheus.prometheusSpec.remoteWrite[0].url"
    value = "https://aps-workspaces.ap-northeast-2.amazonaws.com/workspaces/${aws_prometheus_workspace.live_amp_workspace.id}/api/v1/remote_write"
  }

  set {
    name  = "prometheus.prometheusSpec.remoteWrite[0].sigv4.region"
    value = var.region
  }
}

resource "aws_prometheus_workspace" "live_amp_workspace" {
  alias = "live-amp-workspace"
}

resource "aws_iam_policy" "amp_remote_write" {
  name = "AMPRemoteWritePolicy"
  policy = jsonencode({
    Version = "2012-10-17",
    Statement = [
      {
        Effect = "Allow",
        Action = [
          "aps:RemoteWrite",
          "aps:GetSeries",
          "aps:GetLabels",
          "aps:GetMetricMetadata"
        ],
        Resource = "*"
      }
    ]
  })
}

resource "kubernetes_service_account" "amp_sa" {
  metadata {
    name      = "amp-sa"
    namespace = "monitoring"
    annotations = {
      "eks.amazonaws.com/role-arn" = module.amp_irsa.iam_role_arn
    }
  }
}

module "amp_irsa" {
  source  = "terraform-aws-modules/iam/aws//modules/iam-assumable-role-with-oidc"
  version = "5.39.0"

  create_role      = true
  role_name        = "amp-irsa-role"
  provider_url     = module.eks.oidc_provider
  role_policy_arns = [aws_iam_policy.amp_remote_write.arn]
  oidc_fully_qualified_subjects = [
    "system:serviceaccount:monitoring:amp-sa",
  ]
}
