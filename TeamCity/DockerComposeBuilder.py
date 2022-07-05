from os import system 

finalDockerComposeName = "docker-compose.yaml"

system('rm -f {}'.format(finalDockerComposeName))

#input file
fin = open("docker-compose.prod.yml", "rt")
#output file to write the result to
fout = open(finalDockerComposeName, "wt")

# %env.API_URL%
isProduction = len("%IS_PRODUCTION") > 0 

#for each line in the input file
#read replace the string and write to output file
for line in fin:
    if not isProduction:
        if line.find('#AP') >= 0 :
            fout.write(line.replace('#AP', ''))
        elif line.find('#MGE') >= 0:
            fout.write(line.replace('#MGE', ''))
        else:
            fout.write(line)
    else:
        fout.write(line.replace('#NP', ''))
    
	
	
#close input and output files
fin.close()
fout.close()