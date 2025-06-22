resource "aws_s3_bucket" "loki_s3_storage" {
  bucket = "live-loki-s3"

  tags = {
    Name = "live-loki-s3"
  }
}

resource "aws_prometheus_workspace" "live_amp_workspace" {
  alias = "live-amp-workspace"
}

locals {
  amp_workspace_url = aws_prometheus_workspace.live_amp_workspace.prometheus_endpoint
}

resource "kubernetes_namespace" "monitoring" {
  metadata {
    name = "monitoring"
  }
}

resource "kubernetes_service_account" "monitoring_sa" {
  metadata {
    name      = "monitoring-sa"
    namespace = "monitoring"
    annotations = {
      "eks.amazonaws.com/role-arn" = module.monitoring_irsa.iam_role_arn
    }
  }

  depends_on = [module.eks]
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
    name  = "loki.serviceAccount.name"
    value = kubernetes_service_account.monitoring_sa.metadata[0].name
  }

  set {
    name  = "grafana.serviceAccount.name"
    value = kubernetes_service_account.monitoring_sa.metadata[0].name
  }

  set {
    name  = "grafana.datasources.datasources\\.yaml.datasources[2].jsonData.sigV4Region"
    value = var.region
  }

  set {
    name  = "grafana.datasources.datasources\\.yaml.datasources[2].url"
    value = local.amp_workspace_url
  }

  depends_on = [module.eks, null_resource.wait_for_aws_lb_controller]
}

resource "helm_release" "prometheus_stack" {
  name       = "prometheus-stack"
  repository = "https://prometheus-community.github.io/helm-charts"
  chart      = "kube-prometheus-stack"
  namespace  = "monitoring"

  values = [
    file("config/prometheus_values.yaml")
  ]

  set {
    name  = "grafana.enabled"
    value = "false"
  }

  set {
    name  = "prometheus.serviceAccount.name"
    value = kubernetes_service_account.monitoring_sa.metadata[0].name
  }

  set {
    name  = "prometheus.prometheusSpec.remoteWrite[0].url"
    value = "${local.amp_workspace_url}/api/v1/remote_write"
  }

  set {
    name  = "prometheus.prometheusSpec.remoteWrite[0].sigv4.region"
    value = var.region
  }

  depends_on = [module.eks]
}
