# Introduction
데이터엔지니어가 개발을 진행할 기본 인프라를 terraform으로 구축한 코드입니다. 이 환경을 기준으로 점차 개선을 하며 진행하시면 될 것 같습니다. 어디까지나 기초환경이며, 자유롭게 변경하세요!

---

# Architecture

![alt text](assets/dev-architecture.png)
- 사용 리소스: `EC2`, `Aurora`, `S3`
- vpc는 default vpc 사용했습니다.
- subnet은 모두 public입니다.(caz: default vpc의 subnet은 모두 public입니다.)
- 리소스 간 권한 설정은 `role.tf`를 참고해주세요.
- `lambda`는 AWS에 이미 등록되었다는 가정하에 개발되었습니다.

---

# 실행 방법
## 리포지토리 클론
```
git clone https://github.com/cdkkim/de-mlops.git
cd infra/dev
```

## AWS SSO 설치
- `awscli` 최신버전을 설치해주세요. 최신 버전이 `aws sso configure`가 더 쉽습니다.
### linux
```bash
sudo apt remove awscli
curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip"
unzip awscliv2.zip
sudo ./aws/install
```
### mac
```bash
curl "https://awscli.amazonaws.com/AWSCLIV2.pkg" -o "AWSCLIV2.pkg"
sudo installer -pkg AWSCLIV2.pkg -target /
```
### window
```bash
Invoke-WebRequest "https://awscli.amazonaws.com/AWSCLIV2.msi" -OutFile "AWSCLIV2.msi"
Start-Process msiexec.exe -ArgumentList '/i AWSCLIV2.msi /quiet' -Wait
```

## AWS SSO 설정
```bash
aws configure sso # access, secret key 입력, profile 명을 꼭 설정해주세요
# SSO session name (Recommended): middlek
# SSO start URL [None]: https://...
# SSO region [None]: ap-northeast-2
# SSO registration scopes [sso:account:access]: # enter
# Default client Region [ap-northeast-2]: # enter
# CLI default output format (json if not specified) [None]: #enter
# Profile name [AdministratorAccess-456330605094]: middlek
# To use this profile, specify the profile name using --profile, as shown:
aws sso login --profile <프로필명>
```

## 개인 환경 변수 수정
- `variable.tf` 수정
- 프로필 명은 `aws configure sso`에서 입력한 값
- 키이름은 `aws console` => `EC2` => `좌측 메뉴` => `키 페어` 메뉴에서 확인
```hcl
variable "region" {
  description = "AWS region"
  type        = string
  default     = "ap-northeast-2"
}

variable "profile" {
  description = "AWS SSO profile"
  type        = string
  default     = "프로필명"
}

variable "key_name" {
  description = "AWS key name"
  type        = string
  default     = "키이름"
}
```

## aws 인프라 적용
```bash
terraform init
terraform validate # 문법상 오류가 없는지 확인
AWS_PROFILE=<프로필명> terraform apply
```
- 약 10분 경과 후 AWS 인프라 반영 완료

## connection test
- `your_key.pem`파일을 반드시 가지고 있어야 합니다.
### EC2 접속
```bash
terraform output
# instance_id=i-asdasdad
# instance_public_ip=43.203.3.5
ssh -i /path/to/your_key.pem ubuntu@43.203.3.5
```
### awscli 설치
```
sudo apt update
sudo apt install awscli
```
### s3, rds 연결 테스트
```
aws s3 ls
aws rds describe-db-instances
```

## 리소스 정리
- 해당 명령어를 실행시키면 **모든 리소스가 제거됩니다. 중요 파일은 백업해주세요.**
```bash
AWS_PROFILE=<프로필명> terraform destroy
```
