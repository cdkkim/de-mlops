resource "aws_s3_bucket" "s3_storage" {
  bucket = "live-s3-${random_pet.name.id}"

  tags = {
    Name = "live-s3-${random_pet.name.id}"
  }
}

resource "aws_db_subnet_group" "aurora_subnet" {
  subnet_ids = module.vpc.private_subnets
}

resource "aws_rds_cluster" "rds_cluster" {
  cluster_identifier   = "live-aurora-cluster"
  engine               = "aurora-mysql"
  master_username      = "admin"
  master_password      = "password"
  db_subnet_group_name = aws_db_subnet_group.aurora_subnet.name
  skip_final_snapshot  = true
}

resource "aws_rds_cluster_instance" "rds_instance" {
  count                = 1
  identifier           = "live-aurora-instance"
  cluster_identifier   = aws_rds_cluster.rds_cluster.cluster_identifier
  instance_class       = "db.t3.medium"
  engine               = aws_rds_cluster.rds_cluster.engine
  db_subnet_group_name = aws_db_subnet_group.aurora_subnet.name
}

resource "aws_security_group" "aurora_security_group" {
  name        = "live-aurora-security-group"
  description = "Allow MySQL access from EC2"
  vpc_id      = module.vpc.vpc_id

  ingress {
    description     = "MySQL from EC2"
    from_port       = 3306
    to_port         = 3306
    protocol        = "tcp"
    security_groups = [module.eks.node_security_group_id]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}
