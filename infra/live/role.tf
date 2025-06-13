resource "aws_iam_policy" "live_s3_rw_policy" {
  name = "live-s3-readwrite"
  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "s3:ListAllMyBuckets"
        ]
        Resource = ["*"]
      },
      {
        Effect = "Allow"
        Action = [
          "s3:ListBucket"
        ]
        Resource = [
          "arn:aws:s3:::live-s3-${random_pet.name.id}",
          "arn:aws:s3:::live-loki-s3"
        ]
      },
      {
        Effect = "Allow"
        Action = [
          "s3:GetObject",
          "s3:PutObject"
        ]
        Resource = [
          "arn:aws:s3:::live-s3-${random_pet.name.id}/*",
          "arn:aws:s3:::live-loki-s3/*"
        ]
      }
    ]
  })
}

resource "aws_iam_policy" "live_rds_access_policy" {
  name = "live-rds-access"
  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "rds:DescribeDBInstances",
          "rds:DescribeDBClusters",
          "rds-db:connect"
        ]
        Resource = "*"
      }
    ]
  })
}

resource "aws_iam_policy" "live_alb_controller_policy" {
  name        = "live-alb-controller-policy"
  description = "Custom ALB Controller IAM policy"

  policy = file("config/alb_policy.json")
}

module "irsa" {
  source  = "terraform-aws-modules/iam/aws//modules/iam-assumable-role-with-oidc"
  version = "5.39.0"

  create_role  = true
  role_name    = "live-eks-role"
  provider_url = module.eks.oidc_provider
  role_policy_arns = [
    aws_iam_policy.live_s3_rw_policy.arn,
    aws_iam_policy.live_rds_access_policy.arn,
    aws_iam_policy.live_alb_controller_policy.arn
  ]

  oidc_fully_qualified_subjects = [
    "system:serviceaccount:kube-system:live-eks-sa",
    "system:serviceaccount:default:live-eks-sa"
  ]
}
