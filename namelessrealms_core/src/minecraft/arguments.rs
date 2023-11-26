use regex::Regex;
use serde::Deserialize;
use crate::util::utils;

use super::{version_metadata::{Arguments, LibrariesRules}, libraries};

#[derive(Debug, Clone, Deserialize)]
pub struct Argument {
    pub name: String,
    pub key: String,
    pub value: String
}

impl Argument {
    
    // pub fn as_string(&self) -> String {
    //     format!("{} {}", self.name, self.value)
    // }

    pub fn as_array(&self) -> Vec<String> {
        vec![self.name.clone(), self.value.clone()]
    }
}

#[derive(Debug)]
pub struct ArgumentGame {
    pub arguments: Vec<Argument>,
    pub arguments_rules: Vec<serde_json::Value>
}

#[derive(Debug)]
pub struct ArgumentJvm {
    pub arguments: Vec<Argument>,
    pub required: Vec<String>
}

#[derive(Debug)]
pub struct MinecraftArguments<'a> {
    pub higher_version: &'a Option<Arguments>,
    pub lower_version: &'a Option<String>,
    pub version: &'a str
}

impl MinecraftArguments<'_> {
    
    #[tracing::instrument]
    pub fn get_game(&self) -> ArgumentGame {

        let mut arguments: Vec<Argument> = Vec::new();
        let mut _arguments_rules: Vec<serde_json::Value> = Vec::new();

        if utils::is_mc_version("1.13", &self.version) {

            let higher_version = &self.higher_version.as_ref().unwrap();
            let games = &higher_version.game;

            for (i, game) in games.iter().enumerate() {

                if let Some(game) = game.as_str() {

                    let re = Regex::new(r"\$\{[^}]*\}").unwrap();

                    if !re.is_match(game) {
                        arguments.push(Argument {
                            name: game.to_string(),
                            key: games[i + 1].as_str().unwrap().to_string(),
                            value: "".to_string()
                        });
                    }

                } else {
                    
                    // TODO: 1.13 higher version argument game rules

                }

            }

        } else {
            
            // let lower_version = &self.lower_version.as_ref().unwrap();
            // let lower_versions = &lower_version.split_whitespace().collect::<Vec<_>>();
            
            // for (i, lower_version) in lower_versions.iter().enumerate() {

            //     let re = Regex::new(r"\$\{[^}]*\}").unwrap();

            //     if !re.is_match(lower_version) {
            //         arguments.push(Argument {
            //             name: lower_version.to_string(),
            //             key: lower_versions[i + 1].to_string(),
            //             value: "".to_string()
            //         });
            //     }

            // }

            let lower_version = self.lower_version.as_ref().unwrap();
            arguments.extend(extract_parameters_from_arguments(lower_version))

        }

        ArgumentGame {
            arguments,
            arguments_rules: _arguments_rules
        }
    }

    #[tracing::instrument]
    pub fn get_jvm(&self) -> ArgumentJvm {

        if !utils::is_mc_version("1.13", &self.version) {
            panic!("1.12 The following (inclusive) version cannot be used get_jvm() function.");
        };

        let mut arguments: Vec<Argument> = Vec::new();
        let mut required: Vec<String> = Vec::new();

        let higher_version = &self.higher_version.as_ref().unwrap();
        let jvms = &higher_version.jvm;

        for (i, jvm) in jvms.iter().enumerate() {

            if let Some(jvm) = jvm.as_str() {

                if Regex::new(r"=\$\{[^}]*\}").unwrap().is_match(jvm) {

                    let jvm_values = jvm.split("=${").collect::<Vec<_>>();

                    arguments.push(Argument {
                        name: jvm_values.get(0).unwrap().to_string(),
                        key: format!("${{{}", jvm_values.get(1).unwrap().to_string()),
                        value: "".to_string()
                    });

                } else if !Regex::new(r"\$\{[^}]*\}").unwrap().is_match(jvm) {
                    
                    arguments.push(Argument {
                        name: jvm.to_string(),
                        key: jvms[i + 1].as_str().unwrap().to_string(),
                        value: "".to_string()
                    });

                }

            } else if let Some(jvm) = jvm.as_object() {
                
                let rules = jvm.get("rules").unwrap();
                let value = jvm.get("value").unwrap();

                let is_rules = match serde_json::from_value::<Vec<LibrariesRules>>(rules.clone()) {
                    Ok(value) => libraries::is_rules(&value),
                    Err(error) => panic!("{}", error),
                };

                if is_rules {

                    let mut values: Vec<String> = Vec::new();

                    if value.is_string() {

                        values.push(value.as_str().unwrap().to_string());

                    } else {

                        values = match serde_json::from_value::<Vec<String>>(value.clone()) {
                            Ok(v) => v,
                            Err(error) => panic!("{}", error),
                        };

                    }

                    for value in values.iter() {
                        required.push(value.to_string());
                    }
                }
            }

        }

        ArgumentJvm {
            arguments,
            required
        }
    }
}

#[tracing::instrument]
pub fn extract_parameters_from_arguments(minecraft_arguments: &str) -> Vec<Argument> {

    let mut arguments: Vec<Argument> = Vec::new();
    let minecraft_arguments = minecraft_arguments.split_whitespace().collect::<Vec<_>>();

    let regex_1 = Regex::new(r"\$\{[^}]*\}").unwrap();
    let regex_2 = Regex::new(r"^--").unwrap();

    for (i, minecraft_argument) in minecraft_arguments.iter().enumerate() {
        if regex_2.is_match(minecraft_argument) {

            let two_value = minecraft_arguments[i + 1].to_owned();

            if regex_1.is_match(&two_value) || regex_2.is_match(&two_value) {
                arguments.push(Argument {
                    name: minecraft_argument.to_string(),
                    key: minecraft_arguments[i + 1].to_string(),
                    value: "".to_owned()
                });   
            } else {
                arguments.push(Argument {
                    name: minecraft_argument.to_string(),
                    key: "".to_owned(),
                    value: minecraft_arguments[i + 1].to_string()
                });
            }
        }
    }
    arguments
}