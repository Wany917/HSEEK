#include <stdio.h>
#include <stdlib.h>
#include <sys/types.h>
#include <unistd.h>

void forkexample()
{
	int x = 1;
	pid_t p = fork();
	if(p<0){
	perror("fork fail");
	exit(1);
	}
	else if (p == 0)
        for(int i=0; i<5; i++){
            sleep(10);
            printf("Child has x = %d\n", ++x);
        }
	else
        for(int i=0; i<5; i++){
            printf("Parent has x = %d\n", --x);
            sleep(10);

        }
}
		
int main()
{
	forkexample();
	return 0;
}
