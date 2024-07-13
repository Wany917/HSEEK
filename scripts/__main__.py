import os
import pulumi
from pulumi_docker import Image, Container, DockerBuildArgs

# Lire l'ID utilisateur depuis la configuration Pulumi
config = pulumi.Config()
user_id = config.require("user_id")

dockerfile_dir = os.path.expanduser(f"~/data/{user_id}/cont")
log_dir = os.path.expanduser(f"~/data/{user_id}/temp_log")

image_name = "localhost/clamav_cont:v1.0"

image = Image("clamav-image",
              build=DockerBuildArgs(context=dockerfile_dir, platform="linux/amd64"),
              image_name=image_name,
              skip_push=True
)

container = Container(f"c1_user_{user_id}",
                      image=image.image_name,
                      name=f"c1_user_{user_id}",
                      mounts=[{
                          'target': '/scan/log',
                          'source': log_dir,
                          'type': 'bind'
                      }],
)
