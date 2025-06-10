data "aws_key_pair" "existing_key" {
  key_name = var.key_name
}

resource "aws_instance" "dev_instance" {
    ami = "ami-08943a151bd468f4e"
    instance_type = "t2.micro"
    subnet_id = data.aws_subnets.default_subnets.ids[0]
    key_name = data.aws_key_pair.existing_key.key_name
    vpc_security_group_ids = [aws_security_group.dev_instance_sg.id]

    iam_instance_profile = aws_iam_instance_profile.dev_instance_profile.name

    tags = {
        Name = "dev-instance"
    }
}

resource "aws_security_group" "dev_instance_sg" {
    name = "dev-instance-sg"
    description = "Allow access from EC2"
    vpc_id = data.aws_vpc.default_vpc.id

    ingress {
        description = "SSH from EC2"
        from_port = 22
        to_port = 22
        protocol = "tcp"
        cidr_blocks = ["0.0.0.0/0"]
    }

    ingress {
        description = "Streamlit"
        from_port   = 8501
        to_port     = 8501
        protocol    = "tcp"
        cidr_blocks = ["0.0.0.0/0"]
    }

    egress {
        from_port = 0
        to_port = 0
        protocol = "-1"
        cidr_blocks = ["0.0.0.0/0"]
    }
}
    