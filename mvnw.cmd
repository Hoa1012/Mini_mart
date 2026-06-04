@REM ----------------------------------------------------------------------------
@REM Licensed to the Apache Software Foundation (ASF) under one
@REM or more contributor license agreements.
@REM ----------------------------------------------------------------------------
@REM Maven Wrapper Script for Windows
@REM ----------------------------------------------------------------------------

@IF "%__MVNW_ARG0_NAME__%"=="" (SET __MVNW_ARG0_NAME__=%~nx0)
@SET __MVNW_CMD__=
@SET __MVNW_ERROR__=
@SET __MVNW_PSMODULEP_SAVE=%PSModulePath%
@SET PSModulePath=
@FOR /F "usebackq tokens=1* delims==" %%A IN (`powershell -noprofile "& {$ErrorActionPreference='Stop';Get-Content '.mvn\wrapper\maven-wrapper.properties' | Where-Object {$_ -match '^distributionUrl='} | ForEach-Object {$_ -replace 'distributionUrl=',''}}"`) DO @(
  SET "__MVNW_CMD__=%%A"
)
@SET PSModulePath=%__MVNW_PSMODULEP_SAVE%

@SET MVNW_REPOURL=https://repo.maven.apache.org/maven2
@SET WRAPPER_JAR="%~dp0\.mvn\wrapper\maven-wrapper.jar"

@REM Download maven-wrapper.jar if not present
@IF NOT EXIST %WRAPPER_JAR% (
  powershell -Command "&{$uri='%MVNW_REPOURL%/org/apache/maven/wrapper/maven-wrapper/3.2.0/maven-wrapper-3.2.0.jar';Invoke-WebRequest -Uri $uri -OutFile '%~dp0\.mvn\wrapper\maven-wrapper.jar'}" 2>nul
)

@REM Run Maven with wrapper
@SET MAVEN_PROJECTBASEDIR=%~dp0
@SET MAVEN_OPTS=%MAVEN_OPTS% -Dmaven.multiModuleProjectDirectory=%MAVEN_PROJECTBASEDIR%

@IF EXIST %WRAPPER_JAR% (
  java %MAVEN_OPTS% -jar %WRAPPER_JAR% %*
) ELSE (
  @ECHO ERROR: Could not download maven-wrapper.jar
  @ECHO Please run: mvn wrapper:wrapper
  @EXIT /B 1
)
