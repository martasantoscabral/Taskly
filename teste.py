import subprocess, os

a = subprocess.run('npm -v', shell=True)
print(a)