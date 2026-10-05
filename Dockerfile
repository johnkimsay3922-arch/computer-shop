FROM eclipse-temurin:21-jdk

WORKDIR /app

COPY . .

RUN ./mvnw clean package "-Dmaven.test.skip=true"
CMD ["java", "-jar", "target/computersp-0.0.1-SNAPSHOT.jar"]