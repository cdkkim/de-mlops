
module "eks_auth" {
  source  = "terraform-aws-modules/eks/aws//modules/aws-auth"
  version = "~> 20.0"
  
  manage_aws_auth_configmap = true

  aws_auth_roles = [
    {
      rolearn  = var.sso_admin_role_arn
      username = "admin"
      groups   = ["system:masters"]
    },
    {
      rolearn  = var.sso_developer_role_arn
      username = "developer"
      groups   = ["dev-group"]
    }
  ]
  depends_on = [module.eks]
}

resource "kubernetes_cluster_role_binding" "admin_binding" {
  metadata {
    name = "admin-role-binding"
  }

  role_ref {
    api_group = "rbac.authorization.k8s.io"
    kind      = "ClusterRole" # 클러스터 전체 권한
    name      = "cluster-admin"
  }

  subject {
    kind      = "User"
    name      = "admin" # aws-auth에서 정의한 username
    api_group = "rbac.authorization.k8s.io"
  }
}

resource "kubernetes_role" "dev_role" {
  metadata {
    name      = "dev-access"
    namespace = "default"
  }

  rule {
    api_groups = [""]
    resources  = ["pods", "services", "configmaps"]
    verbs      = ["get", "list", "create", "update", "delete", "watch"]
  }
}

resource "kubernetes_role_binding" "dev_binding" {
  metadata {
    name      = "dev-binding"
    namespace = "default"
  }

  role_ref {
    api_group = "rbac.authorization.k8s.io"
    kind      = "Role" # namespace 내 권한
    name      = kubernetes_role.dev_role.metadata[0].name
  }

  subject {
    kind      = "Group"
    name      = "dev-group" # aws-auth에서 정의한 그룹
  }
}
