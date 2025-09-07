-- User service
CREATE USER useruser WITH PASSWORD 'userpass';
CREATE DATABASE userdb OWNER useruser;

-- Social service
CREATE USER socialuser WITH PASSWORD 'socialpass';
CREATE DATABASE socialdb OWNER socialuser;

-- Workout service
CREATE USER workoutuser WITH PASSWORD 'workoutpass';
CREATE DATABASE workoutdb OWNER workoutuser;

-- Progress service
CREATE USER progressuser WITH PASSWORD 'progresspass';
CREATE DATABASE progressdb OWNER progressuser;
