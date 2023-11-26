#[macro_use]
extern crate lazy_static;

lazy_static! {
    static ref FORGE_MANIFEST_V1_QUERY: VersionReq =
        VersionReq::parse(">=8.0.684, <23.5.2851").unwrap();
    static ref FORGE_MANIFEST_V2_QUERY_P1: VersionReq =
        VersionReq::parse(">=23.5.2851, <=36.1.66").unwrap();
    static ref FORGE_MANIFEST_V3_QUERY_P1: VersionReq =
        VersionReq::parse(">=36.1.66").unwrap();
    // static ref FORGE_MANIFEST_V2_QUERY_P1: VersionReq =
    //     VersionReq::parse(">=23.5.2851, <31.2.52").unwrap();
    // static ref FORGE_MANIFEST_V2_QUERY_P2: VersionReq =
    //     VersionReq::parse(">=32.0.1, <37.0.0").unwrap();
    // static ref FORGE_MANIFEST_V3_QUERY: VersionReq =
    //     VersionReq::parse(">=37.0.0").unwrap();
}

mod api;
mod minecraft;
mod util;
mod process;
mod store;

use semver::VersionReq;
pub use store::*;
pub use process::*;
pub use util::*;
pub use api::*;
pub use minecraft::*;
pub use util::error::*;