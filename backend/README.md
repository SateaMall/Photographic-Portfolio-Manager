To test backend upload with H2:
$env:SPRING_PROFILES_ACTIVE="dev"
mvn spring-boot:run


Then upload a photo:
curl.exe -F "file=@C:\Users\Satea AlMallouhi\Desktop\pic\Les Traces & Nous FR\Une_foule_vers_le_ciel.jpg" ` -F "owner=Satea" ` http://localhost:8080/api/admin/photos 

    