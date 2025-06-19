module "eks" {
  source  = "terraform-aws-modules/eks/aws"
  version = "20.8.5"

  cluster_name    = "live-eks-${random_pet.name.id}"
  cluster_version = "1.32" # 1.32 is the latest version 구 버전 사용시 extended support 서비스를 사용함으로써 추가 비용 발생.

  cluster_endpoint_public_access           = true
  enable_cluster_creator_admin_permissions = true

  vpc_id     = module.vpc.vpc_id
  subnet_ids = module.vpc.private_subnets

  enable_irsa = true

  eks_managed_node_group_defaults = {
    ami_type = "AL2_x86_64"
  }

  eks_managed_node_groups = {
    one = {
      name = "live-eks-node-group-1"

      instance_types = ["t3.large"]

      min_size     = 1
      max_size     = 1
      desired_size = 1
    }
  }
}

resource "helm_release" "cert_manager" {
  name             = "cert-manager"
  chart            = "cert-manager"
  repository       = "https://charts.jetstack.io"
  namespace        = "cert-manager"
  create_namespace = true

  set {
    name  = "installCRDs"
    value = "true"
  }

  depends_on = [module.eks, null_resource.wait_for_aws_lb_controller]
}

resource "kubernetes_service_account" "live_eks_sa_kubesys" {
  metadata {
    name      = "live-eks-sa"
    namespace = "kube-system"
    annotations = {
      "eks.amazonaws.com/role-arn" = module.irsa.iam_role_arn
    }
  }
}

resource "kubernetes_service_account" "live_eks_sa_default" {
  metadata {
    name      = "live-eks-sa"
    namespace = "default"
    annotations = {
      "eks.amazonaws.com/role-arn" = module.irsa.iam_role_arn
    }
  }
}

resource "helm_release" "aws_lb_controller" {
  name       = "aws-lb-controller"
  repository = "https://aws.github.io/eks-charts"
  chart      = "aws-load-balancer-controller"
  namespace  = "kube-system"

  set {
    name  = "clusterName"
    value = module.eks.cluster_name
  }

  set {
    name  = "serviceAccount.create"
    value = "false"
  }

  set {
    name  = "serviceAccount.name"
    value = kubernetes_service_account.live_eks_sa_kubesys.metadata[0].name
  }

  depends_on = [module.eks]
}

resource "helm_release" "argocd" {
  name       = "argocd"
  repository = "https://argoproj.github.io/argo-helm"
  chart      = "argo-cd"
  namespace  = "argocd"
  version    = "8.0.15"

  create_namespace = true

  values = [
    file("config/argo_values.yaml")
  ]

  depends_on = [module.eks]
}

resource "kubectl_manifest" "main_ingress" {
  yaml_body  = file("config/ingress/main.yaml")
  depends_on = [null_resource.wait_for_aws_lb_controller]
}

resource "kubectl_manifest" "argo_ingress" {
  yaml_body  = file("config/ingress/argo.yaml")
  depends_on = [helm_release.argocd, null_resource.wait_for_aws_lb_controller]
}

resource "kubectl_manifest" "grafana_ingress" {
  yaml_body  = file("config/ingress/grafana.yaml")
  depends_on = [helm_release.loki_stack, null_resource.wait_for_aws_lb_controller]
}

resource "kubectl_manifest" "argo_resource" {
  yaml_body  = file("config/argo_resource.yaml")
  depends_on = [helm_release.argocd]
}

resource "null_resource" "update_kubeconfig" {
  provisioner "local-exec" {
    command = <<EOT
      aws eks --region ${var.region} update-kubeconfig --name ${module.eks.cluster_name} --profile ${var.profile}
    EOT
  }

  depends_on = [module.eks]
}

resource "null_resource" "wait_for_aws_lb_controller" {
  provisioner "local-exec" {
    command = <<EOT
      echo "Waiting for aws-load-balancer-controller webhook..."
      kubectl wait --namespace kube-system --for=condition=Available deployment/aws-lb-controller-aws-load-balancer-controller --timeout=120s
    EOT
  }

  depends_on = [helm_release.aws_lb_controller]
}
