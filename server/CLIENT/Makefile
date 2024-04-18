CC = gcc
CFLAGS = -Wall -Wextra -IINCLUDE
SRCDIR = ./SRC
SRC_SOURCES = $(wildcard $(SRCDIR)/*.c)
SRC_OBJECTS = $(SRC_SOURCES:.c=.o)
MAIN_SOURCE = main.c
MAIN_OBJECT = $(MAIN_SOURCE:.c=.o)
EXECUTABLE = main

all: $(EXECUTABLE)

$(EXECUTABLE): $(MAIN_OBJECT) $(SRC_OBJECTS)
	$(CC) $(CFLAGS) $^ -o $@

%.o: %.c
	$(CC) $(CFLAGS) -c $< -o $@

clean:
	rm -f $(SRC_OBJECTS) $(MAIN_OBJECT) $(EXECUTABLE)
