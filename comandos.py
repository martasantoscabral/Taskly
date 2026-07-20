import subprocess, os

if os.path.isfile(".env"):
    with open(".env", "w") as f:
      f.write("DATABASE_URL=\"postgresql://taskly_user:1446@localhost:5432/taskly_db/\"")
else:
  env = open(".env", "x")
  with open(".env", "w") as f:
    f.write("DATABASE_URL=\"postgresql://taskly_user:1446@localhost:5432/taskly_db/\"")

##Instalar dependencias##

##1. express
subprocess.check_call('npm install express dotenv', shell=True)

##2.node_modules
subprocess.check_call('npm install -D typescript tsx @types/node @types/express', shell=True)

##3.prisma
subprocess.check_call('npm install prisma@6 @prisma/client@7', shell=True)

##4.adapter
subprocess.check_call('npm install @prisma/adapter-pg pg', shell=True)

##5.zod
subprocess.check_call('npm install zod swagger-ui-express swagger-jsdoc', shell=True)

##6.swagger
subprocess.check_call('npm install -D @types/swagger-ui-express @types/swagger-jsdoc', shell=True)

##7. helmet
subprocess.check_call('npm install helmet cors express-rate-limit jsonwebtoken bcryptjs', shell=True)

##8.
subprocess.check_call('npm install -D @types/jsonwebtoken @types/bcryptjs', shell=True)

##Depois de mudar o src fazer:##

##1. Fazer migrate
subprocess.check_call('npx prisma migrate dev', shell=True)

##2. Gerar o prisma client
subprocess.check_call('npx prisma generate', shell=True)

##3.Correr o servidor
subprocess.check_call('npx tsx watch src/server.ts', shell=True)