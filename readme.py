import subprocess, os

subprocess.check_call('npm install', shell=True)

if os.path.isfile(".env"):
    with open(".env", "w") as f:
      f.write("DATABASE_URL=\"postgresql://postgres:1446@localhost:5432/taskly_db/\"")
else:
  env = open(".env", "x")
  with open(".env", "w") as f:
    f.write("DATABASE_URL=\"postgresql://postgres:1446@localhost:5432/taskly_db/\"")

subprocess.check_call('npx prisma generate', shell=True)

subprocess.check_call('npx prisma migrate dev', shell=True)

subprocess.check_call('npx prisma generate', shell=True)

subprocess.check_call('npx tsx watch src/server.ts', shell=True)