{
  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixpkgs-unstable";
    flake-utils.url = "github:numtide/flake-utils";
  };

  outputs = { self, nixpkgs, flake-utils, ... }:
    flake-utils.lib.eachDefaultSystem (system:
      let
        pkgs = import nixpkgs {
          inherit system;
        };

      in
      {
        devShells.default = pkgs.mkShell {
          buildInputs = [
            pkgs.corepack_20
            pkgs.nodejs_20
            pkgs.python3
            pkgs.just
          ];
          shellHook = ''
            corepack prepare pnpm@8.15.5 --activate
          '';
        };
      });
}
