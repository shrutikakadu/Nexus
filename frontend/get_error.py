import subprocess
with open('build_error.txt', 'w') as f:
    result = subprocess.run(['npm.cmd', 'run', 'build'], cwd=r'c:\Users\Arya Akhade\OneDrive\Desktop\Nexus\frontend', capture_output=True, text=True)
    f.write("STDOUT:\n")
    f.write(result.stdout)
    f.write("\nSTDERR:\n")
    f.write(result.stderr)
