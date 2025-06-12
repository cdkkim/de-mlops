resource "aws_iam_role" "dev_instance_role" {
  name = "dev-instance-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Effect = "Allow"
      Principal = {
        Service = "ec2.amazonaws.com"
      }
      Action = "sts:AssumeRole"
    }]
  })
}


resource "aws_iam_policy" "s3_full_access_policy" {
  name = "dev-s3-full-access"
  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "s3:GetObject",
          "s3:PutObject",
          "s3:ListBucket",
          "s3:ListAllMyBuckets",
        ]
        Resource = [
          "arn:aws:s3:::dev-s3-${random_pet.name.id}",
          "arn:aws:s3:::dev-s3-${random_pet.name.id}/*"
        ]
      }
    ]
  })
}

resource "aws_iam_policy" "rds_full_access_policy" {
  name = "dev-rds-full-access"
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
        Resource = [
          "*"
        ]
      }
    ]
  })
}

resource "aws_iam_policy" "lambda_invoke_policy" {
  name = "dev-lambda-invoke-policy"
  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        "Effect" : "Allow",
        "Action" : "logs:CreateLogGroup",
        "Resource" : "arn:aws:logs:ap-northeast-2:456330605094:*"
      },
      {
        "Effect" : "Allow",
        "Action" : [
          "logs:CreateLogStream",
          "logs:PutLogEvents"
        ],
        "Resource" : [
          "arn:aws:logs:ap-northeast-2:456330605094:log-group:/aws/lambda/simpleCrawlingApi:*"
        ]
      },
      {
        "Effect" : "Allow",
        "Action" : [
          "ec2:CreateNetworkInterface",
          "ec2:DeleteNetworkInterface",
          "ec2:DescribeNetworkInterfaces"
        ],
        "Resource" : "*"
      }
    ]
  })
}

resource "aws_iam_role_policy_attachment" "attach_s3_policy" {
  role       = aws_iam_role.dev_instance_role.name
  policy_arn = aws_iam_policy.s3_full_access_policy.arn
}

resource "aws_iam_role_policy_attachment" "attach_rds_policy" {
  role       = aws_iam_role.dev_instance_role.name
  policy_arn = aws_iam_policy.rds_full_access_policy.arn
}

resource "aws_iam_role_policy_attachment" "attach_lambda_invoke_policy" {
  role       = aws_iam_role.dev_instance_role.name
  policy_arn = aws_iam_policy.lambda_invoke_policy.arn
}

resource "aws_iam_instance_profile" "dev_instance_profile" {
  name = "dev-instance-profile"
  role = aws_iam_role.dev_instance_role.name
}
